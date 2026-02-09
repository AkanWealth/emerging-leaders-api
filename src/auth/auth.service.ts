import { Injectable, UnauthorizedException, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { OAuth2Client } from 'google-auth-library';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from '../users/dto/update-profile.dto';
import { NotificationPreferencesService } from '../notification-prefrence/notification-prefrence.service';
import { first } from 'rxjs';

@Injectable()
export class AuthService {
  private googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID_MOBILE);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly prisma: PrismaService,
    private readonly notificationPreferencesService: NotificationPreferencesService,
  ) {}

  /**
   * For mobile apps – verify Google ID token from client SDK.
   */
  // async verifyGoogleIdToken(idToken: string) {
  //   const ticket = await this.googleClient.verifyIdToken({
  //     idToken,
  //     audience: process.env.GOOGLE_CLIENT_ID_MOBILE,
  //   });

  //   const payload = ticket.getPayload();
  //   if (!payload?.email || !payload?.name) {
  //     throw new UnauthorizedException('Invalid Google ID token');
  //   }

  //   const { email, name } = payload;
  //   return this.login(email, name);
  // }

   async verifyGoogleIdToken(idToken: string) {
  if (!idToken) {
    throw new BadRequestException('Google ID token is required');
  }

  let payload;
  try {
    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID_MOBILE,
    });
    payload = ticket.getPayload();
  } catch {
    throw new UnauthorizedException('Invalid Google ID token');
  }

  if (!payload?.email || !payload.email_verified) {
    throw new UnauthorizedException('Unverified Google account');
  }

  // Ensure user exists (Google-specific creation)
  await this.usersService.findOrCreateGoogleUser({
    email: payload.email,
    name: payload.name,
    avatar: payload.picture,
  });

  return this.login(payload.email, payload.name);
}



  /**
   * Login or create Google user.
   */
async login(email: string, name: string) {
  let user = await this.usersService.findByEmail(email);
  if (!user) {
    user = await this.usersService.createUserDetail(email, name);
  }

  // Log login activity
  await this.prisma.activityLog.create({
    data: {
      userId: user.id,
      action: 'LOGIN',
      metadata: `User ${user.email} logged in at ${new Date().toISOString()}`,
    },
  });

  await this.prisma.user.update({
  where: { id: user.id },
  data: { lastLogin: new Date() },
});


  const tokens = await this.getTokens(user); 
  await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

  return {
    user: {
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      isAdmin: user.isAdmin,
      status: user.status,
    },
    tokens,
  };
}


  async getTokens(user: { id: string; email: string; isAdmin: boolean }) {
  const [accessToken, refreshToken] = await Promise.all([
    this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        isAdmin: user.isAdmin, //  Include this
      },
      {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: '3d',
      },
    ),
    this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        isAdmin: user.isAdmin, //  Include this too
      },
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

  const tokens = await this.getTokens({
    id: user.id,
    email: user.email,
    isAdmin: user.isAdmin, 
  });

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

    await this. notificationPreferencesService.initializePreferencesForUser(user.id);

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

  const tokens = await this.getTokens({
    id: user.id,
    email: user.email,
    isAdmin: user.isAdmin, 
  });

  await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

  return {
    message: 'OTP verified successfully',
    id: user.id,
    email: user.email,
    firstname: user.firstname,
    lastname: user.lastname,
    profilePicture: user.profilePicture,
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
  const user = await this.prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      firstname: true,
      lastname: true,
      password: true,
      isAdmin: true,
      status: true, // required
    },
  });

  if (!user || !user.password) {
    throw new UnauthorizedException('Invalid email or password');
  }

  const passwordValid = await bcrypt.compare(password, user.password);
  if (!passwordValid) {
    throw new UnauthorizedException('Invalid email or password');
  }

  // Block users that are not verified/active
  if (user.status !== 'ACTIVE') {
    let message = 'Account not active.';

    if (user.status === 'PENDING') {
      message = 'Please verify your account to continue.';
    } else if (user.status === 'INACTIVE') {
      message = 'Your account is inactive. Please contact support.';
    } else if (user.status === 'DEACTIVATED') {
      message = 'Your account has been deactivated. Please contact support';
    }

    throw new ForbiddenException(message);
  }

  const tokens = await this.getTokens({
    id: user.id,
    email: user.email,
    isAdmin: user.isAdmin,
  });

  await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

  return {
    user: {
      id: user.id,
      name:
        user.firstname && user.lastname
          ? `${user.firstname} ${user.lastname}`
          : undefined,
      email: user.email,
      isAdmin: user.isAdmin,
    },
    tokens,
  };
}

async resendOtp(email: string) {
  const user = await this.usersService.findByEmail(email);
  if (!user) {
    throw new NotFoundException('User not found');
  }

  // Only pending users can resend OTP
  // if (user.status !== 'PENDING') {
  //   throw new BadRequestException('Account is already verified or inactive');
  // }

  const otp = this.generateOtp();

  // Replace any existing OTP
  await this.usersService.updateOtp(user.id, otp);

  await this.sendOtpToEmail(user.email, otp);

  return {
    message: 'OTP resent successfully. Please check your email.',
  };
}


async loginWithGoogle(email: string, name: string) {
  let user = await this.prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      firstname: true,
      lastname: true,
      isAdmin: true, 
    },
  });

  // Create user if not found
  if (!user) {
    const newUser = await this.prisma.user.create({
      data: {
        email,
        password: 'google_oauth_placeholder_password',
        profileComplete: true,
      },
    });

    user = {
      id: newUser.id,
      email: newUser.email,
      firstname: newUser.firstname,
      lastname: newUser.lastname,
      isAdmin: false, // default new users to false
    };
  }

  const tokens = await this.getTokens({
    id: user.id,
    email: user.email,
    isAdmin: user.isAdmin,
  });

  await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

  return {
    id: user.id,
    email: user.email,
    tokens,
  };
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
