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


// async getAllUsers(params: {
//   page?: number;
//   limit?: number;
//   search?: string;
// }) {
//   const { page = 1, limit = 10, search } = params;

//   const where: any = {
//     isAdmin: false, 
//   };

//   if (search) {
//     where.OR = [
//       { email: { contains: search, mode: 'insensitive' } },
//       { firstname: { contains: search, mode: 'insensitive' } },
//       { lastname: { contains: search, mode: 'insensitive' } },
//       { name: { contains: search, mode: 'insensitive' } },
//     ];

//     // optional: allow date search (if string parses to valid date)
//     const maybeDate = new Date(search);
//     if (!isNaN(maybeDate.getTime())) {
//       where.OR.push({ createdAt: { equals: maybeDate } });
//     }
//   }

//   const [users, total] = await this.prisma.$transaction([
//     this.prisma.user.findMany({
//       where,
//       skip: (page - 1) * limit,
//       take: limit,
//       orderBy: { createdAt: 'desc' },
//     }),
//     this.prisma.user.count({ where }),
//   ]);

//   return {
//     data: users.map((u) => ({
//       id: u.id,
//       firstname: u.firstname,
//       lastname: u.lastname,
//       email: u.email,
//       name: u.name,
//       createdAt: u.createdAt,
//     })),
//     meta: {
//       total,
//       page,
//       limit,
//       totalPages: Math.ceil(total / limit),
//     },
//   };
// }
async getAllUsers(params: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const { page = 1, limit = 10, search } = params;

  const where: any = {
    isAdmin: false, // only regular users
  };

  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { firstname: { contains: search, mode: 'insensitive' } },
      { lastname: { contains: search, mode: 'insensitive' } },
      { name: { contains: search, mode: 'insensitive' } },
    ];

    // if search is a valid date, check by createdAt or lastLogin
    const maybeDate = new Date(search);
    if (!isNaN(maybeDate.getTime())) {
      where.OR.push(
        { createdAt: { gte: maybeDate } },
        { lastLogin: { gte: maybeDate } },
      );
    }
  }

  const [users, total] = await this.prisma.$transaction([
    this.prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        name: true,
        createdAt: true,
        lastLogin: true,
        status: true,
      },
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

async getAllAdmins(params: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const { page = 1, limit = 10, search } = params;

  const where: any = {
    isAdmin: true, // only admins
  };

  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { firstname: { contains: search, mode: 'insensitive' } },
      { lastname: { contains: search, mode: 'insensitive' } },
      { name: { contains: search, mode: 'insensitive' } },
    ];

    const maybeDate = new Date(search);
    if (!isNaN(maybeDate.getTime())) {
      where.OR.push(
        { createdAt: { gte: maybeDate } },
        { lastLogin: { gte: maybeDate } },
      );
    }
  }

  const [admins, total] = await this.prisma.$transaction([
    this.prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        name: true,
        createdAt: true,
        lastLogin: true,
        status: true,
      },
    }),
    this.prisma.user.count({ where }),
  ]);

  return {
    data: admins,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}


async updateStatus(userId: string, status: 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'DEACTIVATED') {
  const user = await this.prisma.user.update({
    where: { id: userId },
    data: { status },
  });

  await this.prisma.activityLog.create({
    data: {
      userId: user.id,
      action: `STATUS_UPDATE`,
      metadata: `User status changed to ${status}`,
    },
  });

  return { message: `User status updated to ${status}`, user };
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
      phone: true,
      Address: true,
      city: true,
      country: true, 
      postalcode: true,
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
