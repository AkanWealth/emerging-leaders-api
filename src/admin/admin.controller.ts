import { Controller, Post, Body, Get, UseGuards, Query, HttpCode, Res, Req, HttpStatus, UnauthorizedException,} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from '../admin/dto/create-admin.dto';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';
import { VerifyOtpDto } from '../auth/dto/verify-otp.dto';
import { LoginDto } from '../auth/dto/login.dto';
import { ForgotPasswordDto } from '../auth/dto/forgot-password.dto';
import { ResetPasswordDto } from '../auth/dto/reset-password.dto';
import { InviteAdminsDto } from './dto/invite-admin.dto';
import { VerifyInviteDto } from './dto/verify-invite.dto';
import { ResendInviteDto } from './dto/resend-invite.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../common/decorators/guards/admin.guard';
import { Response } from 'express';
import { RequestWithCookies } from '../types/request-with-cookies.interface';
import {  ChangePasswordDto } from './dto/change-password.dto'
 
@ApiTags('Admin Auth')
@Controller('admin/auth')
export class AdminController {
  constructor(private readonly adminAuthService: AdminService) {}

  // @UseGuards(JwtAuthGuard, AdminGuard)
  // @ApiBearerAuth()
  // @Get()
  // @ApiOperation({ summary: 'Get all admins' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'List of all admin users with pagination and filters',
  // })
  // @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default 1)' })
  // @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limit per page (default 10)' })
  // @ApiQuery({ name: 'email', required: false, type: String, description: 'Filter by email' })
  // @ApiQuery({ name: 'name', required: false, type: String, description: 'Filter by name' })
  // @ApiQuery({ name: 'status', required: false, type: String, description: 'Filter by status' })
  // async getAllAdmins(
  //   @Query('page') page?: string,
  //   @Query('limit') limit?: string,
  //   @Query('email') email?: string,
  //   @Query('name') name?: string,
  //   @Query('status') status?: string,
  // ) {
  //   return this.adminAuthService.getAllAdmins({
  //     page: page ? parseInt(page, 10) : 1,
  //     limit: limit ? parseInt(limit, 10) : 10,
  //     email,
  //     name,
  //     status,
  //   });
  // }

  @UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
@Get()
@ApiOperation({ summary: 'Get all admins' })
@ApiResponse({
  status: 200,
  description: 'List of all admin users with pagination and search',
})
@ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default 1)' })
@ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limit per page (default 10)' })
@ApiQuery({ name: 'search', required: false, type: String, description: 'Search across name, email, last joined, last active' })
async getAllAdmins(
  @Query('page') page?: string,
  @Query('limit') limit?: string,
  @Query('search') search?: string,
) {
  return this.adminAuthService.getAllAdmins({
    page: page ? parseInt(page, 10) : 1,
    limit: limit ? parseInt(limit, 10) : 10,
    search,
  });
}


  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Change password' })
  @Post('change-password')
  async changePassword(@Body() dto: ChangePasswordDto) {
    return this.adminAuthService.changePassword(
      dto.email,
      dto.otp,
      dto.newPassword,
      dto.confirmPassword,
    );
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refreshToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          description:
            'Optional refresh token. If not provided, cookie will be used.',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'New tokens issued successfully' })
  @ApiResponse({ status: 401, description: 'Invalid or missing refresh token' })
  async refresh(
    @Req() req: RequestWithCookies,
    @Res({ passthrough: true }) res: Response,
    @Body('refreshToken') bodyToken?: string,
  ) {
    const cookieToken = req.cookies['refresh_token'];
    const refreshToken = bodyToken || cookieToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    const result = await this.adminAuthService.refreshTokens(refreshToken);

    // Always set new cookie for refresh token (regardless of body or cookie input)
    res.cookie('refresh_token', result.tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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

  

//   @Post('request-password-change')
// @ApiOperation({ summary: 'Request OTP for password change (logged-in users)' })
// @UseGuards(JwtAuthGuard)
// async requestPasswordChange(@Req() req) {
//   const userId = req.user.id;
//   return this.adminAuthService.requestPasswordChange(userId);
// }

// @Post('change-password')
// @ApiOperation({ summary: 'Change password using OTP (logged-in users)' })
// async changePassword(@Req() req, @Body() dto: ChangePasswordDto) {
//   const userId = req.user.id;
//   return this.adminAuthService.changePassword(userId, dto.otp, dto.newPassword, dto.confirmPassword);
// }


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
