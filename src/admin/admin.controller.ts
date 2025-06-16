import { Controller, Post, Body } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from '../admin/dto/create-admin.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { VerifyOtpDto } from '../auth/dto/verify-otp.dto';
import { LoginDto } from '../auth/dto/login.dto';
import { ForgotPasswordDto } from '../auth/dto/forgot-password.dto';
import { ResetPasswordDto } from '../auth/dto/reset-password.dto';

@ApiTags('Admin Auth')
@Controller('admin/auth')
export class AdminController {
  constructor(private readonly adminAuthService: AdminService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new admin' })
  @ApiResponse({ status: 201, description: 'Admin registered successfully' })
  register(@Body() dto: CreateAdminDto) {
    return this.adminAuthService.register(dto);
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP for admin account' })
  @ApiResponse({ status: 200, description: 'OTP verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.adminAuthService.verifyOtp(dto.email, dto.otp);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login as admin' })
  @ApiResponse({ status: 200, description: 'Logged in successfully' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  login(@Body() dto: LoginDto) {
    return this.adminAuthService.login(dto.email, dto.password);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset link/OTP' })
  @ApiResponse({ status: 200, description: 'Password reset link/OTP sent' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.adminAuthService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password using token or OTP' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Password mismatch or invalid data' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.adminAuthService.resetPassword(
      dto.email,
      dto.newPassword,
      dto.confirmPassword,
    );
  }
}
