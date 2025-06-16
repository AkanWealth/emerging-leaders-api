// admin/admin-user.service.ts

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { MailService } from '../mail/mail.service';
import { CreateUserByAdminDto } from './dto/create-user.dto';
import { EditUserDto } from './dto/edit-user.dto';

@Injectable()
export class AdminUserService {
  constructor(private prisma: PrismaService, private mailService: MailService) {}

  async getAllUsers() {
    return this.prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async createUser(dto: CreateUserByAdminDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new BadRequestException('User already exists');

    const tempPassword = this.generateTempPassword();
    const hashed = await bcrypt.hash(tempPassword, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashed,
        name: `${dto.firstName} ${dto.lastName}`,
      },
    });

    await this.mailService.sendWelcomeEmailWithPassword(dto.email, tempPassword);
    return user;
  }

  async editUser(userId: string, dto: EditUserDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });
  }

  async deleteUser(userId: string) {
    return this.prisma.user.delete({ where: { id: userId } });
  }

  async activateAdmin(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isAdmin: true },
    });
  }

  async deactivateAdmin(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isAdmin: false },
    });
  }

  async inviteUserToBeAdmin(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('User not found');

    const token = this.generateInviteToken();
    await this.mailService.sendAdminInvite(email, token);
    return { message: 'Admin invitation sent' };
  }

  async resendAdminInvite(email: string) {
    return this.inviteUserToBeAdmin(email); // Reuse logic
  }

  private generateTempPassword(): string {
    return Math.random().toString(36).slice(-8); // 8-char random string
  }

  private generateInviteToken(): string {
    return Math.random().toString(36).substring(2, 12);
  }
}
