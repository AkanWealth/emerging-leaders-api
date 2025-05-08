import { Controller, Post, Body, UseGuards, Get, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

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

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // redirects to Google
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
}
