import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { OAuth2Client } from 'google-auth-library';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from '../users/dto/update-profile.dto';
import { MailService } from '../mail/mail.service'; //Import MailService

@Injectable()
export class AuthService {
  private googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService, // Inject MailService
  ) {}

  async validateOrCreateUser(email: string, name: string) {
    let user = await this.usersService.findByEmail(email);
    if (!user) user = await this.usersService.createUserDetail(email, name);
    return user;
  }

  async login(email: string, name: string) {
    const user = await this.validateOrCreateUser(email, name);
    const tokens = await this.getTokens(user.id, email);
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async getTokens(userId: string, email: string) {
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

  async refresh(userId: string, refreshToken: string) {
    const valid = await this.usersService.validateRefreshToken(userId, refreshToken);
    if (!valid) throw new UnauthorizedException('Invalid refresh token');

    const user = await this.usersService.findById(userId);
    const tokens = await this.getTokens(user.id, user.email);
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  // Google login support
  async verifyGoogleIdToken(idToken: string) {
    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email || !payload?.name) {
      throw new UnauthorizedException('Invalid Google ID token');
    }

    const { email, name } = payload;
    return this.login(email, name);
  }

  // Register with OTP
  async register(dto: CreateUserDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new UnauthorizedException('Email already in use');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const otp = this.generateOtp();

    const user = await this.usersService.createUser(dto.email, hashedPassword, otp);

    // Send OTP email
    await this.sendOtpToEmail(dto.email, otp);

    return { message: 'OTP sent to your email for verification' };
  }

  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
  }

  // Replace this with Postmark email service
  async sendOtpToEmail(email: string, otp: string) {
    await this.mailService.sendVerificationEmail(email, otp);
  }

async verifyOtp(email: string, otp: string) {
  const user = await this.usersService.findByEmail(email);

  if (!user || user.otp !== otp) {
    throw new UnauthorizedException('Invalid or expired OTP');
  }

  // Optional: clear the OTP after successful verification
  await this.usersService.clearOtp(user.id);

  // Optional: mark profile complete if needed (you can control this with a flag or status)
  if (!user.profileComplete) {
    await this.usersService.markProfileComplete(user.id);
  }

  // Generate tokens
  const tokens = await this.getTokens(user.id, user.email);
  await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

  return {
    message: 'OTP verified successfully',
    user,
    tokens,
  };
}


  async completeProfile(userId: string, updateDto: UpdateProfileDto) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');

    return this.usersService.updateProfile(userId, updateDto);
  }

  async forgotPassword(email: string) {
  const user = await this.usersService.findByEmail(email);
  if (!user) throw new UnauthorizedException('User not found');

  const otp = this.generateOtp();
  await this.usersService.updateOtp(user.id, otp); // Save OTP to user table

  await this.sendOtpToEmail(email, otp);
  return { message: 'OTP sent to your email for password reset' };
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


}
