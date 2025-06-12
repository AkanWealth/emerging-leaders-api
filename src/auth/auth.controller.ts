// import { Controller, Post, Body, UseGuards, Get, Req, Res, Patch } from '@nestjs/common';
// import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
// import { AuthService } from './auth.service';
// import { AuthGuard } from '@nestjs/passport';
// import { CreateUserDto } from './dto/create-user.dto';
// import { ResetPasswordDto } from './dto/reset-password.dto';
// import { LoginDto } from './dto/login.dto';

// @ApiTags('Authentication')
// @Controller('auth')
// export class AuthController {
//   constructor(private authService: AuthService) {}

//   @Post('login/google')
//   @ApiOperation({ summary: 'Login using Google credentials (email and name)' })
//   @ApiBody({
//     schema: {
//       type: 'object',
//       properties: {
//         email: { type: 'string', example: 'user@example.com' },
//         name: { type: 'string', example: 'John Doe' },
//       },
//       required: ['email', 'name'],
//     },
//   })
//   @ApiResponse({ status: 201, description: 'User logged in successfully with tokens returned' })
//   async googleLogin(@Body() body: { email: string; name: string }) {
//     return this.authService.login(body.email, body.name);
//   }

//   @Post('refresh')
//   @ApiOperation({ summary: 'Refresh authentication tokens' })
//   @ApiBody({
//     schema: {
//       type: 'object',
//       properties: {
//         userId: { type: 'string', example: 'user-uuid-1234' },
//         refreshToken: { type: 'string', example: 'some-refresh-token' },
//       },
//       required: ['userId', 'refreshToken'],
//     },
//   })
//   @ApiResponse({ status: 200, description: 'New access and refresh tokens returned' })
//   async refresh(@Body() body: { userId: string; refreshToken: string }) {
//     return this.authService.refresh(body.userId, body.refreshToken);
//   }

//   @Post('google/mobile')
//   @ApiOperation({ summary: 'Mobile Google login using Google ID token' })
//   @ApiBody({
//     schema: {
//       type: 'object',
//       properties: {
//         idToken: { type: 'string', example: 'google-id-token-string' },
//       },
//       required: ['idToken'],
//     },
//   })
//   @ApiResponse({ status: 200, description: 'User authenticated with Google ID token' })
//   async googleMobileLogin(@Body('idToken') idToken: string) {
//     return this.authService.verifyGoogleIdToken(idToken);
//   }

//   @Get('google')
//   @UseGuards(AuthGuard('google'))
//   @ApiOperation({ summary: 'Redirect to Google OAuth login page' })
//   @ApiResponse({ status: 302, description: 'Redirects to Google for authentication' })
//   async googleAuth() {
//     // This will trigger passport Google OAuth flow
//   }

//   @Post('register')
//   @ApiOperation({ summary: 'Register a new user' })
//   @ApiResponse({ status: 201, description: 'User registered successfully' })
//   async register(@Body() createUserDto: CreateUserDto) {
//     return this.authService.register(createUserDto);
//   }

//   @Post('verify-otp')
//   @ApiOperation({ summary: 'Verify OTP sent to user email' })
//   @ApiBody({
//     schema: {
//       type: 'object',
//       properties: {
//         email: { type: 'string', example: 'user@example.com' },
//         otp: { type: 'string', example: '123456' },
//       },
//       required: ['email', 'otp'],
//     },
//   })
//   @ApiResponse({ status: 200, description: 'OTP verified successfully' })
//   async verifyOtp(@Body() body: { email: string; otp: string }) {
//     return this.authService.verifyOtp(body.email, body.otp);
//   }

//   @Get('google/redirect')
//   @UseGuards(AuthGuard('google'))
//   @ApiOperation({ summary: 'Google OAuth callback redirect URL' })
//   @ApiResponse({ status: 302, description: 'Redirects to frontend with access token' })
//   async googleRedirect(@Req() req, @Res() res) {
//     const tokens = await this.authService.login(req.user.email, req.user.name);
//     return res.redirect(`http://localhost:4200/login/success?token=${tokens.accessToken}`);
//   }

//   @Post('forgot-password')
//   @ApiOperation({ summary: 'Request password reset email' })
//   @ApiBody({
//     schema: {
//       type: 'object',
//       properties: {
//         email: { type: 'string', example: 'user@example.com' },
//       },
//       required: ['email'],
//     },
//   })
//   @ApiResponse({ status: 200, description: 'Password reset email sent if user exists' })
//   async forgotPassword(@Body('email') email: string) {
//     return this.authService.forgotPassword(email);
//   }

//   @Patch('reset-password')
//   @ApiOperation({ summary: 'Reset user password' })
//   @ApiResponse({ status: 200, description: 'Password reset successfully' })
//   async resetPassword(@Body() dto: ResetPasswordDto) {
//     return this.authService.resetPassword(dto.email, dto.newPassword, dto.confirmPassword);
//   }

//    @Post('signin')
//   @ApiOperation({ summary: 'Login with email/password or Gmail' })
//   @ApiResponse({ status: 200, description: 'Successfully logged in with token pair' })
//   @ApiResponse({ status: 401, description: 'Invalid credentials' })
//   async login(@Body() dto: LoginDto) {
//     if (dto.password) {
//       // Login with email & password
//       return this.authService.loginWithCredentials(dto.email, dto.password);
//     } 
//   }

// }

import {
  Body,
  Controller,
  Post,
  UseGuards,
  Req,
  Get,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UpdateProfileDto } from '../users/dto/update-profile.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register user (email/password)' })
  @ApiResponse({ status: 201, description: 'OTP sent to email' })
  async register(@Body() dto: CreateUserDto) {
    return this.authService.register(dto);
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP sent to email' })
  @ApiResponse({ status: 200, description: 'OTP verified, user logged in' })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto.email, dto.otp);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email/password' })
  @ApiResponse({ status: 200, description: 'Returns tokens and user' })
  async login(@Body() dto: LoginDto) {
    return this.authService.loginWithCredentials(dto.email, dto.password);
  }

  @Post('google')
  @ApiOperation({ summary: 'Login or Register using Google ID token' })
  @ApiResponse({ status: 200, description: 'Returns tokens and user' })
  async googleLogin(@Body() dto: GoogleLoginDto) {
    return this.authService.verifyGoogleIdToken(dto.idToken);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh JWT access & refresh tokens' })
  @ApiResponse({ status: 200, description: 'Returns new tokens' })
  async refreshTokens(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.userId, dto.refreshToken);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Send OTP for password reset' })
  @ApiResponse({ status: 200, description: 'OTP sent to email' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password using OTP' })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(
      dto.email,
      dto.newPassword,
      dto.confirmPassword,
    );
  }

  @Post('complete-profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Complete user profile after registration' })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  async completeProfile(@Req() req, @Body() dto: UpdateProfileDto) {
    return this.authService.completeProfile(req.user.sub, dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiResponse({ status: 200, description: 'Returns user info' })
  async me(@Req() req) {
    return req.user;
  }
}
