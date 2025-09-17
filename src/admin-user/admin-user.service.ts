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

async getAllUsers(params: {
  page?: number;
  limit?: number;
  email?: string;
  name?: string;
  role?: string;
  status?: string;
}) {
  const { page = 1, limit = 10, email, name, role, status } = params;

  const where: any = {};
  if (email) where.email = { contains: email, mode: 'insensitive' };
  if (name) {
    where.OR = [
      { firstname: { contains: name, mode: 'insensitive' } },
      { lastname: { contains: name, mode: 'insensitive' } },
    ];
  }
  if (role) where.role = role;
  if (status) where.status = status;

  const [users, total] = await this.prisma.$transaction([
    this.prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    this.prisma.user.count({ where }),
  ]);

  return {
    data: users,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}


async getUserById(id: string) {
  return this.prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      firstname: true,
      lastname: true,
      email: true,
      isAdmin: true,
      profilePicture: true,
      createdAt: true,
      updatedAt: true,
    },
  });
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
