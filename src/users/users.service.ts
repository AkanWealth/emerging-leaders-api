import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

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

  async updateRefreshToken(userId: string, token: string) {
    const hash = await bcrypt.hash(token, 10);
    return this.prisma.user.update({
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
    const user = await this.prisma.user.create({
      data: {
        email,
        password,
        profileComplete: false, // Profile is incomplete until OTP is verified
      },
    });

    // Create an OTP record for the user
    await this.prisma.otp.create({
      data: {
        otp: this.generateOtp(),  // You need to implement OTP generation
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 mins expiry
        userId: user.id,
      },
    });

    return user;
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

  // Update the user's profile after OTP verification
async updateProfile(userId: string, updateDto: UpdateProfileDto) {
  if (!userId) {
    throw new BadRequestException('User ID is required');
  }

  const dataToUpdate = Object.fromEntries(
    Object.entries({
      ...updateDto,
      updatedAt: new Date(),
      dateOfBirth: updateDto.dateOfBirth
        ? new Date(updateDto.dateOfBirth)
        : undefined,
    }).filter(([_, v]) => v !== undefined)
  );

  return this.prisma.user.update({
    where: { id: userId },
    data: dataToUpdate,
  });
}

async getAllVerifiedUsers() {
  return this.prisma.user.findMany({
    where: {
      profileComplete: true, // Only return users with complete profiles
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

async getAllUsers() {
  return this.prisma.user.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });
}

async getUserById(id: string) {
  const user = await this.prisma.user.findUnique({
    where: { id },
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
}
