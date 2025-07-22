import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateModule1Dto } from './dto/create-module1.dto';
import { UpdateModule1Dto } from './dto/update-module1.dto';

@Injectable()
export class Module1Service {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateModule1Dto) {
    return this.prisma.module1.upsert({
      where: { userId },
      update: dto,
      create: { ...dto, userId },
    });
  }

  async findOne(userId: string) {
    const record = await this.prisma.module1.findUnique({
      where: { userId },
    });
    if (!record) throw new NotFoundException('Module1 not found');
    return record;
  }

  async update(userId: string, dto: UpdateModule1Dto) {
    return this.prisma.module1.update({
      where: { userId },
      data: dto,
    });
  }

  async remove(userId: string) {
    return this.prisma.module1.delete({
      where: { userId },
    });
  }
}
