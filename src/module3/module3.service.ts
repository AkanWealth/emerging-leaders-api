import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateModule3Dto } from './dto/create-module3.dto';
import { UpdateModule3Dto } from './dto/update-module3.dto';

@Injectable()
export class Module3Service {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateModule3Dto) {
    const existing = await this.prisma.module3.findUnique({ where: { userId } });
    if (existing) throw new ConflictException('Module3 already exists for this user');

    return this.prisma.module3.create({
      data: {
        userId,
        ...dto,
      },
    });
  }

  async findOne(userId: string) {
    const module = await this.prisma.module3.findUnique({
      where: { userId },
    });
    if (!module) throw new NotFoundException('Module3 not found for this user');
    return module;
  }

  async update(userId: string, dto: UpdateModule3Dto) {
    await this.findOne(userId);
    return this.prisma.module3.update({
      where: { userId },
      data: dto,
    });
  }

  async remove(userId: string) {
    await this.findOne(userId);
    return this.prisma.module3.delete({
      where: { userId },
    });
  }
}
