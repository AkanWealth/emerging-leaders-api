// admin/admin-auth.service.ts

import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateAdminDto } from '../admin/dto/create-admin.dto';
import { randomBytes } from 'crypto';
import { InviteAdminsDto } from './dto/invite-admin.dto';
import { VerifyInviteDto } from './dto/verify-invite.dto';
import { UsersService } from 'src/users/users.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: CreateAdminDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) throw new UnauthorizedException('Email already in use');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        isAdmin: true,
        isSuperAdmin: true,
      },
    });

    const otp = this.generateOtp();
    await this.prisma.otp.create({
      data: {
        userId: user.id,
        otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    await this.mailService.sendOtpEmail(dto.email, otp);

    return { message: 'OTP sent to your email' };
  }

  async verifyOtp(email: string, otp: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.isAdmin) throw new UnauthorizedException('Invalid user');

    const otpRecord = await this.prisma.otp.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord || otpRecord.otp !== otp) {
      throw new UnauthorizedException('Invalid OTP');
    }

    if (otpRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('OTP expired');
    }

    await this.prisma.otp.deleteMany({ where: { userId: user.id } });

    return {
      message: 'OTP verified',
      tokens: await this.getTokens(user),
    };
  }

async login(email: string, password: string) {
  const user = await this.prisma.user.findUnique({ where: { email } });

  if (!user || !user.isAdmin) {
    throw new UnauthorizedException('Not authorized');
  }

  const passwordValid = await bcrypt.compare(password, user.password);
  if (!passwordValid) {
    throw new UnauthorizedException('Invalid password');
  }

  // Generate tokens
  const tokens = await this.getTokens(user);

  // Save hashed refresh token + update last login + log activity
  await this.prisma.$transaction(async (tx) => {
    const hash = await bcrypt.hash(tokens.refreshToken, 10);

    await tx.user.update({
      where: { id: user.id },
      data: {
        refreshToken: hash,
        lastLogin: new Date(),
      },
    });

    await tx.activityLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        metadata: `User ${user.email} logged in at ${new Date().toISOString()}`,
      },
    });
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      isAdmin: user.isAdmin,
      profilePicture: user.profilePicture,
      status: user.status,
    },
    tokens,
  };
}



async refreshTokens(refreshToken: string) {
  let payload: any;
  try {
    payload = this.jwtService.verify(refreshToken, {
      secret: process.env.JWT_REFRESH_SECRET,  
    });
  } catch (e) {
    throw new UnauthorizedException('Invalid refresh token');
  }

  const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || !user.isAdmin) {
    throw new UnauthorizedException('User not found or not admin');
  }

  if (!user.refreshToken) {
    throw new UnauthorizedException('No refresh token found for user');
  }

  const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
  if (!isValid) {
    throw new UnauthorizedException('Refresh token mismatch');
  }

  // Issue new tokens
  const tokens = await this.getTokens(user);

  // Update stored refresh token
  await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

  return {
    user: {
      id: user.id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      isAdmin: user.isAdmin,
      profilePicture: user.profilePicture,
    },
    tokens,
  };
}

// async requestPasswordChange(userId: string) {
//   const user = await this.prisma.user.findUnique({ where: { id: userId } });
//   if (!user) throw new NotFoundException('User not found');

//   // Generate OTP
//   const code = Math.floor(100000 + Math.random() * 900000).toString();
//   const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

//   // Save OTP
//   await this.prisma.otp.create({
//     data: { userId, otp: code, expiresAt },
//   });

//   // Send via email
//     await this.mailService.sendChangePasswordOtp(
//     user.email,
//     `${user.firstname ?? ''} ${user.lastname ?? ''}`.trim(),
//     code,
//   );


//   return { message: 'OTP sent to your email' };
// }

// async changePassword(userId: string, otp: string, newPassword: string, confirmPassword: string) {
//   if (newPassword !== confirmPassword) {
//     throw new BadRequestException('Passwords do not match');
//   }

//   const record = await this.prisma.otp.findFirst({
//     where: { userId, otp },
//     orderBy: { createdAt: 'desc' },
//   });

//   if (!record || record.expiresAt < new Date()) {
//     throw new BadRequestException('Invalid or expired OTP');
//   }

//   // Update password (hash before saving)
//   const hashed = await bcrypt.hash(newPassword, 10);
//   await this.prisma.user.update({
//     where: { id: userId },
//     data: { password: hashed },
//   });

//   // Invalidate OTP
//   await this.prisma.otp.delete({ where: { id: record.id } });

//   return { message: 'Password changed successfully' };
// }


  // async forgotPassword(email: string) {
  //   const user = await this.prisma.user.findUnique({ where: { email } });
  //   if (!user || !user.isAdmin) throw new NotFoundException('Admin not found');

  //   const otp = this.generateOtp();
  //   await this.prisma.otp.create({
  //     data: {
  //       userId: user.id,
  //       otp,
  //       expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  //     },
  //   });

  //   await this.mailService.sendOtpEmail(email, otp);
  //   return { message: 'OTP sent to your email' };
  // }

async forgotPassword(email: string) {
  const user = await this.prisma.user.findUnique({ where: { email } });
  if (!user || !user.isAdmin) throw new NotFoundException('Admin not found');

  // Generate reset code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  // Save code
  await this.prisma.otp.create({
    data: {
      userId: user.id,
      otp: code,
      expiresAt,
    },
  });

  // Create reset link
  const resetLink = `${this.configService.get<string>('APP_URL')}/reset-password?email=${encodeURIComponent(email)}&code=${code}`;

  // Send reset link via email
  await this.mailService.sendAdminPasswordResetLink(
    user.email,
    `${user.firstname ?? ''} ${user.lastname ?? ''}`.trim(),
    resetLink, //  passed as resetLink
    code,
  );

  return { message: 'Password reset link sent to your email' };
}

async changePassword(email: string, otp: string, newPassword: string, confirmPassword: string) {
  const user = await this.prisma.user.findUnique({ where: { email } });
  if (!user) throw new NotFoundException('User not found');

  // ✅ Check password match
  if (newPassword !== confirmPassword) {
    throw new BadRequestException('Passwords do not match');
  }

  // Find OTP record
  const otpRecord = await this.prisma.otp.findFirst({
    where: {
      userId: user.id,
      otp,
      used: false,
      expiresAt: { gte: new Date() },
    },
  });

  if (!otpRecord) throw new BadRequestException('Invalid or expired OTP');

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password
  await this.prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  // Mark OTP as used
  await this.prisma.otp.update({
    where: { id: otpRecord.id },
    data: { used: true },
  });

  return { message: 'Password changed successfully' };
}

  async resetPassword(email: string, newPassword: string, confirmPassword: string) {
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.isAdmin) throw new NotFoundException('Admin not found');

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashed },
    });

    return { message: 'Password updated successfully' };
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

private async getTokens(user: { id: string; email: string; isAdmin: boolean }) {
  const payload = {
    sub: user.id,
    email: user.email,
    isAdmin: user.isAdmin,
  };

  const [accessToken, refreshToken] = await Promise.all([
    this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET,  // ✅ short-lived
      expiresIn: '15m',
    }),
    this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET, // ✅ long-lived
      expiresIn: '7d',
    }),
  ]);

  return { accessToken, refreshToken };
}




async inviteAdmin(dto: InviteAdminsDto) {
  // 1. Check if email already exists
  const existingUser = await this.prisma.user.findUnique({
    where: { email: dto.email },
  });

  if (existingUser) {
    throw new BadRequestException('This email is already registered as a user.');
  }

  // 2. Generate a temporary password (random string, 16 chars)
  const tempPassword = randomBytes(8).toString('hex');
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  // 3. Create minimal admin user
  const user = await this.prisma.user.create({
    data: {
      firstname: dto.firstname,
      lastname: dto.lastname,
      email: dto.email,
      password: hashedPassword, // required by schema
      isAdmin: true,
      profileComplete: false,
    },
  });

  // 4. Generate OTP code
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  // 5. Save OTP
  await this.prisma.otp.create({
    data: {
      otp,
      expiresAt,
      userId: user.id,
    },
  });

  // 6. Send invite email with OTP + link
  await this.mailService.sendAdminInviteWithCode(
    user.email,
    `${user.firstname} ${user.lastname}`,
    otp,
  );

  return { message: 'Admin invited successfully', email: user.email };
}


async verifyInviteCode(dto: VerifyInviteDto) {
  const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
  if (!user) throw new NotFoundException('User not found');

  const otp = await this.prisma.otp.findFirst({
    where: {
      userId: user.id,
      otp: dto.code,
      used: false,
      expiresAt: { gt: new Date() },
    },
  });

  if (!otp) throw new BadRequestException('Invalid or expired code');

  // Mark OTP as used
  await this.prisma.otp.update({
    where: { id: otp.id },
    data: { used: true },
  });

  // Update user status to ACTIVE
  await this.prisma.user.update({
    where: { id: user.id },
    data: { status: 'ACTIVE' },
  });

  return { message: 'Code verified successfully, account is now active' };
}

async resendInvite(dto: { email: string }) {
  // 1. Find the user
  const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
  if (!user) throw new NotFoundException('User not found');

  // 2. Invalidate old OTPs
  await this.prisma.otp.updateMany({
    where: { userId: user.id, used: false },
    data: { used: true },
  });

  // 3. Generate new OTP + expiry
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await this.prisma.otp.create({
    data: {
      otp,
      expiresAt,
      userId: user.id,
    },
  });

  // 4. Send email again
  await this.mailService.sendAdminInviteWithCode(
    user.email,
    `${user.firstname} ${user.lastname}`,
    otp,
  );

  return { message: 'New invite code sent', email: user.email };
}

async getAllAdmins(params: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const { page = 1, limit = 10, search } = params;

  const where: any = { isAdmin: true };

  if (search) {
    const searchDate = new Date(search);
    const isValidDate = !isNaN(searchDate.getTime());

    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { firstname: { contains: search, mode: 'insensitive' } },
      { lastname: { contains: search, mode: 'insensitive' } },
      ...(isValidDate
        ? [
            { createdAt: { gte: searchDate } }, // last joined
            { updatedAt: { gte: searchDate } }, // last active
          ]
        : []),
    ];
  }

  const [admins, total] = await this.prisma.$transaction([
    this.prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstname: true,
        lastname: true,
        Address: true,
        postalcode: true,
        city: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    this.prisma.user.count({ where }),
  ]);

  return {
    data: admins,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}



async getAllAdminsCount() {
  return this.prisma.user.count({
    where: { isAdmin: true },
  });
}


}
