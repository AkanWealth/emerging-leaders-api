import {
  Body,
  Controller,
  Post,
  UseGuards,
  Req,
  Res,
  Get,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterFcmTokenDto } from './dto/fc-tonken.dto'; 
import { JwtAuthGuard } from './jwt-auth.guard';
import { UpdateProfileDto } from '../users/dto/update-profile.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { ResendOtpDto } from './dto/resend';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //  Register with email/password
  @Post('register')
  @ApiOperation({ summary: 'Register user (email/password)' })
  @ApiResponse({ status: 201, description: 'OTP sent to email' })
  async register(@Body() dto: CreateUserDto) {
    return this.authService.register(dto);
  }

  //  Verify OTP after registration
  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP sent to email' })
  @ApiResponse({ status: 200, description: 'OTP verified, user logged in' })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto.email, dto.otp);
  }

  //  Login using email/password
  @Post('login')
  @ApiOperation({ summary: 'Login with email/password' })
  @ApiResponse({ status: 200, description: 'Returns tokens and user' })
  async login(@Body() dto: LoginDto) {
    return this.authService.loginWithCredentials(dto.email, dto.password);
  }

  // Resend OTP for email verification
 @Post('resend-otp')
@ApiOperation({ summary: 'Resend OTP for account verification' })
@ApiResponse({ status: 200, description: 'OTP resent successfully' })
@ApiResponse({ status: 400, description: 'Account already verified or inactive' })
@ApiResponse({ status: 404, description: 'User not found' })
async resendOtp(@Body() dto: ResendOtpDto) {
  return this.authService.resendOtp(dto.email);
}


  //  Google login using mobile ID token
  @Post('google')
  @ApiOperation({ summary: 'Login or Register using Google ID token' })
  @ApiResponse({ status: 200, description: 'Returns tokens and user' })
  async googleLogin(@Body() dto: GoogleLoginDto) {
    return this.authService.verifyGoogleIdToken(dto.idToken);
  }

  //  Redirect user to Google for web login
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Redirect to Google OAuth login page' })
  @ApiResponse({ status: 302, description: 'Redirects to Google for authentication' })
  async googleAuth() {
    // Handled by passport
  }

  //  Google callback endpoint for web OAuth
   @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback redirect URL' })
  @ApiResponse({ status: 302, description: 'Redirects to frontend with access token' })
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const user = (req as any).user;
    
    // NOTE: This assumes your login method returns tokens inside user['tokens']
    const accessToken = user?.tokens?.accessToken;

    // Replace the redirect URL with your actual frontend path
    const redirectUrl = `https://www.emergingleaders.net/auth-success?token=${accessToken}`;

    // Perform the redirect
    res.redirect(302, redirectUrl);
  }

  // 📱 Dedicated endpoint for Google mobile login
  @Post('google/mobile')
  @ApiOperation({ summary: 'Mobile Google login using Google ID token' })
  @ApiResponse({ status: 200, description: 'User authenticated with Google ID token' })
  async googleMobileLogin(@Body('idToken') idToken: string) {
    return this.authService.verifyGoogleIdToken(idToken);
  }

  // 🔄 Refresh tokens
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh JWT access & refresh tokens' })
  @ApiResponse({ status: 200, description: 'Returns new tokens' })
  async refreshTokens(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.userId, dto.refreshToken);
  }

  // 📧 Request password reset
  @Post('forgot-password')
  @ApiOperation({ summary: 'Send OTP for password reset' })
  @ApiResponse({ status: 200, description: 'OTP sent to email' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  // 🔑 Reset password with OTP
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

  
@Post('fcm-token')
@UseGuards(JwtAuthGuard)
@ApiOperation({ summary: 'Register FCM token for notifications' })
@ApiBody({ type: RegisterFcmTokenDto })
@ApiResponse({ status: 201, description: 'FCM token saved or ignored if duplicate' })
async registerFcmToken(
  @Req() req: any,
  @Body() dto: RegisterFcmTokenDto
) {
  const user = req.user;
  return this.authService.saveFcmToken(user.id, dto.token, dto.platform);
}



  // 👤 Complete profile after authentication
 @Post('complete-profile')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiOperation({ summary: 'Complete user profile after registration' })
@ApiResponse({ status: 200, description: 'Profile updated' })
async completeProfile(@Req() req, @Body() dto: UpdateProfileDto) {
  return this.authService.completeProfile(req.user.id, dto); //FIXED
}


  // 🙋‍♂️ Get authenticated user details
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiResponse({ status: 200, description: 'Returns user info' })
  async me(@Req() req) {
    return req.user;
  }
}
