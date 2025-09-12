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

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
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
        // isSuperAdmin: true,
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
      tokens: await this.getTokens(user.id, user.email),
    };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.isAdmin) throw new UnauthorizedException('Not authorized');

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) throw new UnauthorizedException('Invalid password');

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profilePicture: user.profilePicture,
      },
      tokens: await this.getTokens(user.id, user.email),
    };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.isAdmin) throw new NotFoundException('Admin not found');

    const otp = this.generateOtp();
    await this.prisma.otp.create({
      data: {
        userId: user.id,
        otp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    await this.mailService.sendOtpEmail(email, otp);
    return { message: 'OTP sent to your email' };
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

  private async getTokens(userId: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email },
        { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '15m' },
      ),
      this.jwtService.signAsync(
        { sub: userId, email },
        { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' },
      ),
    ]);
    return { accessToken, refreshToken };
  }


async inviteAdmin(dto: InviteAdminsDto ) {
  // 1. Generate a temporary password (random string, 16 chars)
  const tempPassword = randomBytes(8).toString('hex');
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  // 2. Create minimal admin user
  const user = await this.prisma.user.create({
    data: {
      firstname: dto.firstname,
      lastname: dto.lastname,
      email: dto.email,
      password: hashedPassword, //  required by schema
      isAdmin: true,
      profileComplete: false,
    },
  });

  // 3. Generate OTP code
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  // 4. Save OTP
  await this.prisma.otp.create({
    data: {
      otp,
      expiresAt,
      userId: user.id,
    },
  });

  // 5. Send invite email with OTP + link
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

  // Mark OTP as used (only once)
  await this.prisma.otp.update({
    where: { id: otp.id },
    data: { used: true },
  });

  // Return success (frontend will now redirect to password page)
  return { message: 'Code verified successfully' };
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

async getAllAdmins() {
  return this.prisma.user.findMany({
    where: { isAdmin: true },
  });
}


}
