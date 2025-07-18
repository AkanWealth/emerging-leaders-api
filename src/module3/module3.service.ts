import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateModule3Dto } from './dto/create-module3.dto';
import { UpdateModule3Dto } from './dto/update-module3.dto';

@Injectable()
export class Module3Service {
  constructor(private prisma: PrismaService) {}

  async create(workbookId: string, userId: string, dto: CreateModule3Dto) {
    const workbook = await this.prisma.workbook.findUnique({ where: { id: workbookId } });
    if (!workbook) throw new NotFoundException('Workbook not found');

    return this.prisma.module3.create({
      data: {
        workbookId,
        userId,
        ...dto,
      },
    });
  }

  async findOne(workbookId: string, userId: string) {
    const module = await this.prisma.module3.findUnique({
      where: {
        workbookId_userId: {
          workbookId,
          userId,
        },
      },
    });

    if (!module) throw new NotFoundException('Module3 not found for this user and workbook');
    return module;
  }

  async update(workbookId: string, userId: string, dto: UpdateModule3Dto) {
    await this.findOne(workbookId, userId);
    return this.prisma.module3.update({
      where: {
        workbookId_userId: {
          workbookId,
          userId,
        },
      },
      data: dto,
    });
  }

  async remove(workbookId: string, userId: string) {
    await this.findOne(workbookId, userId);
    return this.prisma.module3.delete({
      where: {
        workbookId_userId: {
          workbookId,
          userId,
        },
      },
    });
  }
}
