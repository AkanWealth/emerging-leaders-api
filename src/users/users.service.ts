import { Injectable } from '@nestjs/common';
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
    return this.prisma.user.create({ data: { email, name } });
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
  async createUser(email: string, password: string, otp: string) {
    return this.prisma.user.create({
      data: {
        email,
        password,
        otp,
        profileComplete: false, // Profile is incomplete until OTP is verified
      },
    });
  }

  async updateOtp(userId: string, otp: string) {
  return this.prisma.user.update({
    where: { id: userId },
    data: {
      resetPasswordToken: otp,
      resetPasswordExpires: new Date(Date.now() + 15 * 60 * 1000), // 15 mins expiry
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
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...updateDto,
        updatedAt: new Date(),
      },
    });
  }

  async clearOtp(userId: string) {
  return this.prisma.user.update({
    where: { id: userId },
    data: {
      otp: null,
      otpExpiresAt: null,
    },
  });
}

 async updatePassword(userId: string, hashedPassword: string) {
  return this.prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
      otp: null,              // optional: clear OTP
      otpExpiresAt: null,
    },
  });
}

}
