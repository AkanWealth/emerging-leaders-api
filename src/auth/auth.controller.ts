import { Controller, Post, Body, UseGuards, Get, Req, Res, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from './dto/create-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';


@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // Simulated Google login — plug in actual Google logic here
  @Post('login/google')
  async googleLogin(@Body() body: { email: string; name: string }) {
    return this.authService.login(body.email, body.name);
  }

  @Post('refresh')
  async refresh(@Body() body: { userId: string; refreshToken: string }) {
    return this.authService.refresh(body.userId, body.refreshToken);
  }

  @Post('google/mobile')
  async googleMobileLogin(@Body('idToken') idToken: string) {
  return this.authService.verifyGoogleIdToken(idToken);
}


  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // redirects to Google
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
  return this.authService.register(createUserDto);
}

@Post('verify-otp')
async verifyOtp(@Body() body: { email: string; otp: string }) {
  return this.authService.verifyOtp(body.email, body.otp);
}


  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleRedirect(@Req() req, @Res() res) {
    const tokens = await this.authService.login(req.user.email, req.user.name);
    
    // Example: redirect with tokens (for web)
    return res.redirect(`http://localhost:4200/login/success?token=${tokens.accessToken}`);
    
    // For mobile: just return JSON
    // return res.json(tokens);
  }

@Post('forgot-password')
async forgotPassword(@Body('email') email: string) {
  return this.authService.forgotPassword(email);
}

@Patch('reset-password')
async resetPassword(@Body() dto: ResetPasswordDto) {
  return this.authService.resetPassword(dto.email, dto.newPassword, dto.confirmPassword);
}


}
