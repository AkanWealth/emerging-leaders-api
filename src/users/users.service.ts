import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async createUser(email: string, name: string) {
    return this.prisma.user.create({ data: { email, name } });
  }

  async updateRefreshToken(userId: string, token: string) {
    const hash = await bcrypt.hash(token, 10);
    return this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hash },
    });
  }

  async validateRefreshToken(userId: string, token: string): Promise<boolean> {
    const user = await this.findById(userId);
    if (!user || !user.refreshToken) return false;
    return bcrypt.compare(token, user.refreshToken);
  }
}
