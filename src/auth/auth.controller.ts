import { Controller, Post, Body, UseGuards, Get, Req, Res, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from './dto/create-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login/google')
  @ApiOperation({ summary: 'Login using Google credentials (email and name)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        name: { type: 'string', example: 'John Doe' },
      },
      required: ['email', 'name'],
    },
  })
  @ApiResponse({ status: 201, description: 'User logged in successfully with tokens returned' })
  async googleLogin(@Body() body: { email: string; name: string }) {
    return this.authService.login(body.email, body.name);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh authentication tokens' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: 'user-uuid-1234' },
        refreshToken: { type: 'string', example: 'some-refresh-token' },
      },
      required: ['userId', 'refreshToken'],
    },
  })
  @ApiResponse({ status: 200, description: 'New access and refresh tokens returned' })
  async refresh(@Body() body: { userId: string; refreshToken: string }) {
    return this.authService.refresh(body.userId, body.refreshToken);
  }

  @Post('google/mobile')
  @ApiOperation({ summary: 'Mobile Google login using Google ID token' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        idToken: { type: 'string', example: 'google-id-token-string' },
      },
      required: ['idToken'],
    },
  })
  @ApiResponse({ status: 200, description: 'User authenticated with Google ID token' })
  async googleMobileLogin(@Body('idToken') idToken: string) {
    return this.authService.verifyGoogleIdToken(idToken);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Redirect to Google OAuth login page' })
  @ApiResponse({ status: 302, description: 'Redirects to Google for authentication' })
  async googleAuth() {
    // This will trigger passport Google OAuth flow
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP sent to user email' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        otp: { type: 'string', example: '123456' },
      },
      required: ['email', 'otp'],
    },
  })
  @ApiResponse({ status: 200, description: 'OTP verified successfully' })
  async verifyOtp(@Body() body: { email: string; otp: string }) {
    return this.authService.verifyOtp(body.email, body.otp);
  }

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback redirect URL' })
  @ApiResponse({ status: 302, description: 'Redirects to frontend with access token' })
  async googleRedirect(@Req() req, @Res() res) {
    const tokens = await this.authService.login(req.user.email, req.user.name);
    return res.redirect(`http://localhost:4200/login/success?token=${tokens.accessToken}`);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset email' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
      },
      required: ['email'],
    },
  })
  @ApiResponse({ status: 200, description: 'Password reset email sent if user exists' })
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Patch('reset-password')
  @ApiOperation({ summary: 'Reset user password' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.email, dto.newPassword, dto.confirmPassword);
  }

   @Post('signin')
  @ApiOperation({ summary: 'Login with email/password or Gmail' })
  @ApiResponse({ status: 200, description: 'Successfully logged in with token pair' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto) {
    if (dto.password) {
      // Login with email & password
      return this.authService.loginWithCredentials(dto.email, dto.password);
    } 
  }

}
