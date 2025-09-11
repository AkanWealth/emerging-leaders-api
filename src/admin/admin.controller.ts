import { Controller, Post, Body } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from '../admin/dto/create-admin.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { VerifyOtpDto } from '../auth/dto/verify-otp.dto';
import { LoginDto } from '../auth/dto/login.dto';
import { ForgotPasswordDto } from '../auth/dto/forgot-password.dto';
import { ResetPasswordDto } from '../auth/dto/reset-password.dto';
import { InviteAdminsDto } from './dto/invite-admin.dto';
import { VerifyInviteDto } from './dto/verify-invite.dto';
import { ResendInviteDto } from './dto/resend-invite.dto'


@ApiTags('Admin Auth')
@Controller('admin/auth')
export class AdminController {
  constructor(private readonly adminAuthService: AdminService) {}

  @Post('invite-admin')
  @ApiOperation({ summary: 'Invite a new admin (send OTP + link)' })
  @ApiResponse({ status: 201, description: 'Invitation sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid email or failed to send invite' })
  inviteAdmin(@Body() dto: InviteAdminsDto) {
    return this.adminAuthService.inviteAdmin(dto);
  }

  @Post('verify-invite')
  @ApiOperation({ summary: 'Verify admin invite code' })
  @ApiResponse({ status: 200, description: 'Invite verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired invite code' })
  verifyInvite(@Body() dto: VerifyInviteDto) {
    return this.adminAuthService.verifyInviteCode(dto);
  }

@Post('resend-invite')
@ApiOperation({ summary: 'Resend admin invite (new code + link)' })
@ApiResponse({ status: 200, description: 'New invite sent successfully' })
@ApiResponse({ status: 404, description: 'User not found' })
resendInvite(@Body() dto: ResendInviteDto) {
  return this.adminAuthService.resendInvite(dto);
}


  @Post('register')
  @ApiOperation({ summary: 'Register a new admin account' })
  @ApiResponse({ status: 201, description: 'Admin registered successfully' })
  @ApiResponse({ status: 400, description: 'Validation error or invite not verified' })
  register(@Body() dto: CreateAdminDto) {
    return this.adminAuthService.register(dto);
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP for admin account activation' })
  @ApiResponse({ status: 200, description: 'OTP verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.adminAuthService.verifyOtp(dto.email, dto.otp);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login as admin' })
  @ApiResponse({ status: 200, description: 'Logged in successfully (returns JWT)' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  login(@Body() dto: LoginDto) {
    return this.adminAuthService.login(dto.email, dto.password);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset (send OTP/link)' })
  @ApiResponse({ status: 200, description: 'Password reset OTP/link sent' })
  @ApiResponse({ status: 400, description: 'Invalid email' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.adminAuthService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password using OTP or token' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Passwords do not match or invalid token/OTP' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.adminAuthService.resetPassword(
      dto.email,
      dto.newPassword,
      dto.confirmPassword,
    );
  }
}
