// import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common'; 
// import { JwtService } from '@nestjs/jwt';
// import { UsersService } from '../users/users.service';
// import { OAuth2Client } from 'google-auth-library';
// import * as bcrypt from 'bcrypt';
// import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateProfileDto } from '../users/dto/update-profile.dto';
// import { MailService } from '../mail/mail.service'; // Import MailService
// import { PrismaService } from '../prisma/prisma.service'; // Import PrismaService if needed
// import { LoginDto } from './dto/login.dto';


// @Injectable()
// export class AuthService {
//   private googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

//   constructor(
//     private usersService: UsersService,
//     private jwtService: JwtService,
//     private mailService: MailService, 
//     private prisma: PrismaService, 
//   ) {}

//   async validateOrCreateUser(email: string, name: string) {
//     let user = await this.usersService.findByEmail(email);
//     if (!user) user = await this.usersService.createUserDetail(email, name);
//     return user;
//   }

//   async login(email: string, name: string) {
//     const user = await this.validateOrCreateUser(email, name);
//     const tokens = await this.getTokens(user.id, email);
//     await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);
//     return tokens;
//   }

  
//   async getTokens(userId: string, email: string) {
//     const [accessToken, refreshToken] = await Promise.all([
//       this.jwtService.signAsync(
//         { sub: userId, email },
//         { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '15m' },
//       ),
//       this.jwtService.signAsync(
//         { sub: userId, email },
//         { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' },
//       ),
//     ]);
//     return { accessToken, refreshToken };
//   }

//  async refresh(userId: string, refreshToken: string) {
//   const valid = await this.usersService.validateRefreshToken(userId, refreshToken);
//   if (!valid) {
//     throw new UnauthorizedException('Invalid refresh token');
//   }

//   const user = await this.usersService.findById(userId);
//   if (!user) {
//     throw new UnauthorizedException('User not found');
//   }

//   const tokens = await this.getTokens(user.id, user.email);
//   await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

//   return tokens;
// }             


//   // Google login support
//   async verifyGoogleIdToken(idToken: string) {
//     const ticket = await this.googleClient.verifyIdToken({
//       idToken,
//       audience: process.env.GOOGLE_CLIENT_ID,
//     });

//     const payload = ticket.getPayload();
//     if (!payload?.email || !payload?.name) {
//       throw new UnauthorizedException('Invalid Google ID token');
//     }

//     const { email, name } = payload;
//     return this.login(email, name);
//   }

//   // Register with OTP
//  async register(dto: CreateUserDto) {
//   const existing = await this.usersService.findByEmail(dto.email);
//   if (existing) throw new UnauthorizedException('Email already in use');

//   const hashedPassword = await bcrypt.hash(dto.password, 10);
//   const otp = this.generateOtp();

//   // Create user
//   const user = await this.usersService.createUser(dto.email, hashedPassword);

//   // Save OTP to OTP table
//   await this.usersService.saveOtp(user.id, otp);

//   // Send OTP email
//   await this.sendOtpToEmail(dto.email, otp);

//   return { message: 'OTP sent to your email for verification' };
// }


//   generateOtp(): string {
//     return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
//   }

//   // Replace this with Postmark email service
//   async sendOtpToEmail(email: string, otp: string) {
//     await this.mailService.sendOtpEmail(email, otp);
//   }

//   // OTP verification during registration or password reset
// async verifyOtp(email: string, otp: string) {
//   const user = await this.usersService.findByEmail(email);

//   if (!user) {
//     throw new UnauthorizedException('User not found');
//   }

//   // Fetch the latest OTP record
//   const otpRecord = await this.usersService.findLatestOtpByUserId(user.id);

//   if (!otpRecord) {
//     throw new UnauthorizedException('No OTP record found');
//   }

//   const now = new Date();

//   if (otpRecord.otp !== otp) {
//     throw new UnauthorizedException('Invalid OTP');
//   }

//   if (otpRecord.expiresAt < now) {
//     throw new UnauthorizedException('OTP has expired');
//   }

//   // OTP is valid — clean up and proceed
//   await this.usersService.clearOtp(user.id);

//   if (!user.profileComplete) {
//     await this.usersService.markProfileComplete(user.id);
//   }

//   const tokens = await this.getTokens(user.id, user.email);
//   await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

//   return {
//     message: 'OTP verified successfully',
//     user,
//     tokens,
//   };
// }



//   // Complete profile after OTP verification
//   async completeProfile(userId: string, updateDto: UpdateProfileDto) {
//     const user = await this.usersService.findById(userId);
//     if (!user) throw new UnauthorizedException('User not found');

//     return this.usersService.updateProfile(userId, updateDto);
//   }

//   // Forgot password logic
//   async forgotPassword(email: string) {
//     const user = await this.usersService.findByEmail(email);
//     if (!user) throw new UnauthorizedException('User not found');

//     const otp = this.generateOtp();
//     await this.usersService.updateOtp(user.id, otp); // Save OTP to user table

//     await this.sendOtpToEmail(email, otp);
//     return { message: 'OTP sent to your email for password reset' };
//   }

//   // Reset password logic
//   async resetPassword(email: string, newPassword: string, confirmPassword: string) {
//     if (newPassword !== confirmPassword) {
//       throw new BadRequestException('Passwords do not match');
//     }

//     const user = await this.usersService.findByEmail(email);
//     if (!user) throw new NotFoundException('User not found');

//     const hashedPassword = await bcrypt.hash(newPassword, 10);

//     return this.usersService.updatePassword(user.id, hashedPassword);
//   }

// async loginWithCredentials(email: string, password: string) {
//   const user = await this.prisma.user.findUnique({ where: { email } });
//   if (!user || !user.password) {
//     throw new UnauthorizedException('Invalid email or password');
//   }

//   const passwordValid = await bcrypt.compare(password, user.password);
//   if (!passwordValid) {
//     throw new UnauthorizedException('Invalid email or password');
//   }

//   const tokens = await this.getTokens(user.id, user.email);
//   await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

//   // Return tokens plus user info (you can pick fields you want)
//   return {
//     user: {
//       id: user.id,
//       name: user.name,
//       email: user.email,
//       // add more fields if you want here
//     },
//     tokens,
//   };
// }


// // Inside auth.service.ts

// async loginWithGoogle(email: string, name: string) {
//   // Try to find user by email
//   let user = await this.prisma.user.findUnique({ where: { email } });

//   // If not found, create a new user
//   if (!user) {
//     user = await this.prisma.user.create({
//       data: {
//         email,
//         name,
//         password: 'google_oauth_placeholder_password',
//         // You may set other defaults if needed
//         profileComplete: true, // Assuming profile is complete for Google users
//       },
//     });
//   }

//   // Issue tokens
//   const tokens = await this.getTokens(user.id, email);

//   // Store refresh token in DB
//   await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);


//   return tokens;
// }


// }

import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { OAuth2Client } from 'google-auth-library';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from '../users/dto/update-profile.dto';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  private googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Decodes and validates Google ID token, issues app tokens.
   */
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

  /**
   * Login existing user or register new Google user.
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
}
