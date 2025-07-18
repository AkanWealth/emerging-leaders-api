import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateModule1Dto } from './dto/create-module1.dto';
import { UpdateModule1Dto } from './dto/update-module1.dto';

@Injectable()
export class Module1Service {
  constructor(private readonly prisma: PrismaService) {}

  async create(workbookId: string, userId: string, dto: CreateModule1Dto) {
    // Upsert so user can only have one per workbook
    return this.prisma.module1.upsert({
      where: {
        workbookId_userId: { workbookId, userId },
      },
      update: dto,
      create: {
        ...dto,
        workbookId,
        userId,
      },
    });
  }

  async findOne(workbookId: string, userId: string) {
    const record = await this.prisma.module1.findUnique({
      where: {
        workbookId_userId: { workbookId, userId },
      },
    });
    if (!record) throw new NotFoundException('Module1 not found');
    return record;
  }

  async update(workbookId: string, userId: string, dto: UpdateModule1Dto) {
    return this.prisma.module1.update({
      where: {
        workbookId_userId: { workbookId, userId },
      },
      data: dto,
    });
  }

  async remove(workbookId: string, userId: string) {
    return this.prisma.module1.delete({
      where: {
        workbookId_userId: { workbookId, userId },
      },
    });
  }
}
