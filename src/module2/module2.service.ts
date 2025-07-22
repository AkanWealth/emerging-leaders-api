import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateModule2Dto } from './dto/create-module2.dto';
import { UpdateModule2Dto } from './dto/update-module2.dto';

@Injectable()
export class Module2Service {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateModule2Dto) {
    return this.prisma.module2.upsert({
      where: { userId },
      update: dto,
      create: { userId, ...dto },
    });
  }

  async findOne(userId: string) {
    const module = await this.prisma.module2.findUnique({
      where: { userId },
    });
    if (!module) throw new NotFoundException('Module2 not found for this user');
    return module;
  }

  async update(userId: string, dto: UpdateModule2Dto) {
    await this.findOne(userId);
    return this.prisma.module2.update({
      where: { userId },
      data: dto,
    });
  }

  async remove(userId: string) {
    await this.findOne(userId);
    return this.prisma.module2.delete({
      where: { userId },
    });
  }
}
