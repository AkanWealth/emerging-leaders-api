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

}
