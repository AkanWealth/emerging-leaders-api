import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { OAuth2Client } from 'google-auth-library';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from '../users/dto/update-profile.dto';

@Injectable()
export class AuthService {
  private googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID_MOBILE);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * For mobile apps – verify Google ID token from client SDK.
   */
  async verifyGoogleIdToken(idToken: string) {
    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID_MOBILE,
    });

    const payload = ticket.getPayload();
    if (!payload?.email || !payload?.name) {
      throw new UnauthorizedException('Invalid Google ID token');
    }

    const { email, name } = payload;
    return this.login(email, name);
  }

  /**
   * Login or create Google user.
   */
  async login(email: string, name: string) {
    let user = await this.usersService.findByEmail(email);
    if (!user) {
      user = await this.usersService.createUserDetail(email, name);
    }

    const tokens = await this.getTokens(user.id, email);
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      tokens,
    };
  }

  // async getTokens(userId: string, email: string) {
  //   const payload = { sub: userId, email };
  //   const accessToken = await this.jwtService.signAsync(payload, {
  //     expiresIn: '1h',
  //   });
  //   const refreshToken = await this.jwtService.signAsync(payload, {
  //     expiresIn: '7d',
  //   });

  //   return {
  //     accessToken,
  //     refreshToken,
  //   };
  // }

  /**
   * Issues access and refresh tokens.
   */
  async getTokens(userId: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: process.env.JWT_ACCESS_SECRET,
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: '7d',
        },
      ),
    ]);
    return { accessToken, refreshToken };
  }

  /**
   * Handles refresh token validation and rotation.
   */
  async refresh(userId: string, refreshToken: string) {
    const isValid = await this.usersService.validateRefreshToken(
      userId,
      refreshToken,
    );
    if (!isValid) throw new UnauthorizedException('Invalid refresh token');

    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');

    const tokens = await this.getTokens(user.id, user.email);
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  /**
   * Standard email/password registration with OTP verification.
   */
  async register(dto: CreateUserDto) {
    const exists = await this.usersService.findByEmail(dto.email);
    if (exists) throw new UnauthorizedException('Email already in use');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const otp = this.generateOtp();

    const user = await this.usersService.createUser(dto.email, hashedPassword);
    await this.usersService.saveOtp(user.id, otp);
    await this.sendOtpToEmail(dto.email, otp);

    return { message: 'OTP sent to your email' };
  }

  /**
   * OTP verification for email/password flow.
   */
  async verifyOtp(email: string, otp: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('User not found');

    const otpRecord = await this.usersService.findLatestOtpByUserId(user.id);
    if (!otpRecord || otpRecord.otp !== otp) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    if (otpRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('OTP expired');
    }

    await this.usersService.clearOtp(user.id);
    if (!user.profileComplete) {
      await this.usersService.markProfileComplete(user.id);
    }

    const tokens = await this.getTokens(user.id, user.email);
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      message: 'OTP verified successfully',
      user,
      tokens,
    };
  }

 async completeProfile(userId: string, dto: UpdateProfileDto) {
  const user = await this.usersService.findById(userId);
  if (!user) throw new UnauthorizedException('User not found');

  // This triggers full profile logic including wallet/salary/notifications
  return this.usersService.updateProfile(userId, dto);
}


  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('User not found');

    const otp = this.generateOtp();
    await this.usersService.updateOtp(user.id, otp);
    await this.sendOtpToEmail(email, otp);

    return { message: 'OTP sent for password reset' };
  }

  async resetPassword(email: string, newPassword: string, confirmPassword: string) {
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const user = await this.usersService.findByEmail(email);
    if (!user) throw new NotFoundException('User not found');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    return this.usersService.updatePassword(user.id, hashedPassword);
  }

  async loginWithCredentials(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.getTokens(user.id, user.email);
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      tokens,
    };
  }

  async loginWithGoogle(email: string, name: string) {
    let user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          name,
          password: 'google_oauth_placeholder_password',
          profileComplete: true,
        },
      });
    }

    const tokens = await this.getTokens(user.id, email);
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async sendOtpToEmail(email: string, otp: string) {
    await this.mailService.sendOtpEmail(email, otp);
  }

  // Called by mobile/web app when a new token is generated
async saveFcmToken(userId: string, token: string, platform: string) {
  // Avoid duplicates
  const existing = await this.prisma.fcmToken.findUnique({ where: { token } });
  if (!existing) {
    await this.prisma.fcmToken.create({
      data: { token, userId, platform },
    });
  }
}

}
