import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateOrCreateUser(email: string, name: string) {
    let user = await this.usersService.findByEmail(email);
    if (!user) user = await this.usersService.createUser(email, name);
    return user;
  }

  async login(email: string, name: string) {
    const user = await this.validateOrCreateUser(email, name);
    const tokens = await this.getTokens(user.id, email);
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async getTokens(userId: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email },
        { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '15m' },
      ),
      this.jwtService.signAsync(
        { sub: userId, email },
        { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' },
      ),
    ]);
    return { accessToken, refreshToken };
  }

  async refresh(userId: string, refreshToken: string) {
    const valid = await this.usersService.validateRefreshToken(userId, refreshToken);
    if (!valid) throw new UnauthorizedException('Invalid refresh token');

    const user = await this.usersService.findById(userId);
    const tokens = await this.getTokens(user.id, user.email);
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }
}
