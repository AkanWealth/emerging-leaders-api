import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { NotificationsService } from '../notifications/notifications.service'; // Import your NotificationService
import { MailService } from '../mail/mail.service';


@Injectable()
export class UsersService {
 private readonly logger = new Logger(UsersService.name);
  // Inject NotificationService in your constructor
constructor(
  private readonly prisma: PrismaService,
  private readonly notificationsService: NotificationsService,
  private readonly mailService: MailService,
  // private readonly logger: Logger = new Logger('UsersService'),
) {}

async completeUserAccount(userId: string) {
  const tokens = await this.prisma.fcmToken.findMany({
    where: { userId },
  });

  // Optional: you can skip looping tokens since sendToUser already handles push sending
  // But if you want to keep it per-token, it’s fine.

  for (const { token } of tokens) {
    await this.notificationsService.sendToUser(
      userId, // senderId (system-generated notification)
      userId, // receiverId
      '🎉 Account Created!',
      'Your account has been successfully set up. Welcome!',
      { screen: 'Dashboard' },
      'ACCOUNT_CREATED' // optional type
    );
  }
}




  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

async createUserDetail(email: string, name: string) {
  const defaultPassword = await bcrypt.hash('temporary-password', 10);
  return this.prisma.user.create({
    data: {
      email,
      name,
      password: defaultPassword,
    },
  });
}

async saveOtp(userId: string, otp: string) {
  return this.prisma.otp.create({
    data: {
      userId,
      otp,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // expires in 15 minutes
    },
  });
}

async updateRefreshToken(
  userId: string,
  token: string,
  prisma: PrismaService | typeof this.prisma = this.prisma,
) {
  const hash = await bcrypt.hash(token, 10);
  return prisma.user.update({
    where: { id: userId },
    data: { refreshToken: hash },
  });
}


  async validateRefreshToken(userId: string, token: string): Promise<boolean> {
    const user = await this.findById(userId);
    if (!user || !user.refreshToken) return false;
    return bcrypt.compare(token, user.refreshToken);
  }

  // Create the user with incomplete profile (pending OTP verification)
 async createUser(email: string, password: string) {
  return this.prisma.$transaction(async (prisma) => {
    const user = await prisma.user.create({
      data: {
        email,
        password,
        profileComplete: false, // Profile is incomplete until OTP is verified
      },
    });

    // Create Wallet for the user
    await prisma.wallet.create({
      data: {
        userId: user.id,
        balance: 0, // optional since Prisma schema sets default
      },
    });

    // Create OTP
    await prisma.otp.create({
      data: {
        otp: this.generateOtp(), // Make sure this method exists in your service
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 mins
        userId: user.id,
      },
    });

    return user;
  });
}


  // Helper function to generate OTP
  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit OTP
  }

  async updateOtp(userId: string, otp: string) {
    return this.prisma.otp.create({
      data: {
        otp,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 mins expiry
        userId,
      },
    });
  }

  // Mark the user's profile as complete after OTP verification
  async markProfileComplete(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { profileComplete: true },
    });
  }


async updateProfile(userId: string, dto: UpdateProfileDto) {
  if (!userId) throw new BadRequestException('User ID is required');

  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    include: {
      wallet: true,
      currency: true,
      FcmToken: true,
    },
  });

  if (!user) throw new NotFoundException('User not found');

  // 🌍 Validate Currency Code
  let currencyId = user.currencyId;
  let selectedCurrency = user.currency;

  if (dto.code) {
    const currency = await this.prisma.currency.findUnique({
      where: { code: dto.code },
    });
    if (!currency) throw new BadRequestException('Invalid currency code');
    currencyId = currency.id;
    selectedCurrency = currency;
  }

  // 💰 Handle Recurring Income (just record the salary info)
  if (dto.salaryAmount && dto.frequency && dto.startDate && user.wallet?.id && currencyId) {
    const existingSalary = await this.prisma.recurringIncome.findFirst({
      where: {
        userId,
        type: 'SALARY',
        isActive: true,
      },
    });

    const recurringIncomeData = {
      amount: dto.salaryAmount,
      frequency: dto.frequency,
      startDate: new Date(dto.startDate),
      currencyId,
    };

    if (existingSalary) {
      await this.prisma.recurringIncome.update({
        where: { id: existingSalary.id },
        data: recurringIncomeData,
      });
    } else {
      await this.prisma.recurringIncome.create({
        data: {
          userId,
          walletId: user.wallet.id,
          description: 'User salary',
          type: 'SALARY',
          ...recurringIncomeData,
        },
      });
    }
  }

  // 🧼 Update user profile fields
  const {
    code,
    salaryAmount,
    frequency,
    startDate,
    ...rest
  } = dto;

  const updatePayload = Object.fromEntries(
    Object.entries({
      ...rest,
      currencyId,
      dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
      updatedAt: new Date(),
    }).filter(([_, v]) => v !== undefined)
  );

  await this.prisma.user.update({
    where: { id: userId },
    data: updatePayload,
  });

  // ✅ Complete account logic
  if (!user.profileComplete && updatePayload.profileComplete === true) {
    await this.completeUserAccount(userId);
  }

  const updatedUser = await this.prisma.user.findUnique({
    where: { id: userId },
    include: {
      wallet: true,
      currency: true,
    },
  });

  return {
    message: 'Profile updated successfully',
    data: updatedUser,
  };
}

async getAllVerifiedUsers() {
  return this.prisma.user.findMany({
    where: {
      profileComplete: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      wallet: {
        select: {
          id: true,
          balance: true,
        },
      },
      RecurringIncome: {
        where: { isActive: true },
      },
      currency: {
        select: {
          code: true,
          symbol: true,
        },
      },
    },
  });
}


async getAllUsers() {
  return this.prisma.user.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      wallet: {
        select: {
          id: true,
          balance: true, // Include wallet balance
        },  
      },
      RecurringIncome: {
        where: { isActive: true }, // Optional filter
      },
      currency: {
        select: {
          code: true,
          symbol: true, // Include currency code and symbol
        }, // Ensure this relation exists in your Prisma schema
      },
    },
  });
}


async getUserById(id: string) {
  const user = await this.prisma.user.findUnique({
    where: { id },
    include: {
      wallet: {
        select: {
          id: true,
          balance: true,
        },
      },
      RecurringIncome: {
        where: { isActive: true },
      },
      currency: {
        select: {
          code: true,
          symbol: true,
        },
      },
    },
  });

  if (!user) {
    throw new NotFoundException(`User with ID ${id} not found`);
  }

  return user;
}


  async clearOtp(userId: string) {
    // Clear OTP after successful verification or password reset
    return this.prisma.otp.deleteMany({
      where: { userId },
    });
  }

  async updatePassword(userId: string, hashedPassword: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });
  }

  async findLatestOtpByUserId(userId: string) {
    return this.prisma.otp.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }, // Get the latest OTP
    });
  }

  async getUserStats(userId: string) {
  const [completedGoals, completedProjects, userAssessments] = await Promise.all([
    this.prisma.goal.count({
      where: {
        isCompleted: true,
        project: {
          userId: userId,
        },
      },
    }),

    this.prisma.project.count({
      where: {
        completed: true,
        userId: userId,
      },
    }),

    this.prisma.userAssessment.count({
      where: {
        userId: userId,
      },
    }),
  ]);

  return {
    completedGoals,
    completedProjects,
    assessmentsTaken: userAssessments,
  };
}

}
