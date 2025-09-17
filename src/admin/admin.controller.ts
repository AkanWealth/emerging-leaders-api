import { Controller, Post, Body, Get, UseGuards, Query, HttpCode, Res, Req, HttpStatus, UnauthorizedException,} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from '../admin/dto/create-admin.dto';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { VerifyOtpDto } from '../auth/dto/verify-otp.dto';
import { LoginDto } from '../auth/dto/login.dto';
import { ForgotPasswordDto } from '../auth/dto/forgot-password.dto';
import { ResetPasswordDto } from '../auth/dto/reset-password.dto';
import { InviteAdminsDto } from './dto/invite-admin.dto';
import { VerifyInviteDto } from './dto/verify-invite.dto';
import { ResendInviteDto } from './dto/resend-invite.dto';
import { User } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../common/decorators/guards/admin.guard';
import { Response } from 'express';
import { RequestWithCookies } from '../types/request-with-cookies.interface';

@ApiTags('Admin Auth')
@Controller('admin/auth')
export class AdminController {
  constructor(private readonly adminAuthService: AdminService) {}

  @UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
@Get()
@ApiOperation({ summary: 'Get all admins' })
@ApiResponse({
  status: 200,
  description: 'List of all admin users with pagination and filters',
})
async getAllAdmins(
  @Query('page') page?: string,
  @Query('limit') limit?: string,
  @Query('email') email?: string,
  @Query('name') name?: string,
  @Query('status') status?: string,
) {
  return this.adminAuthService.getAllAdmins({
    page: page ? parseInt(page, 10) : 1,
    limit: limit ? parseInt(limit, 10) : 10,
    email,
    name,
    status,
  });
}

@Post('refresh')
async refresh(
  @Req() req: RequestWithCookies,
  @Res({ passthrough: true }) res: Response,
  @Body('refreshToken') bodyToken?: string,
) {
  const cookieToken = req.cookies['refresh_token'];  //  no TS error
  const refreshToken = bodyToken || cookieToken;

  if (!refreshToken) {
    throw new UnauthorizedException('Refresh token missing');
  }

  const result = await this.adminAuthService.refreshTokens(refreshToken);

  res.cookie('refresh_token', result.tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return result;
}

  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
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

  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
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
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login as admin' })
  @ApiResponse({ status: 200, description: 'Logged in successfully (returns JWT)' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.adminAuthService.login(dto.email, dto.password);

    // ✅ Drop refresh token as HttpOnly cookie
    res.cookie('refresh_token', result.tokens.refreshToken, {
      httpOnly: true, // cannot be accessed by JS
      secure: process.env.NODE_ENV === 'production', // only HTTPS in production
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // ✅ Also return it in response body for frontend use
    return result;
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

  @Get('count')
  async getAdminsCount() {
    const count = await this.adminAuthService.getAllAdminsCount();
    return { totalAdmins: count };
  }
}
