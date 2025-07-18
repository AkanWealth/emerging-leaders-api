import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateModule2Dto } from './dto/create-module2.dto';
import { UpdateModule2Dto } from './dto/update-module2.dto';

@Injectable()
export class Module2Service {
  constructor(private prisma: PrismaService) {}

  async create(workbookId: string, userId: string, dto: CreateModule2Dto) {
  const workbook = await this.prisma.workbook.findUnique({ where: { id: workbookId } });
  if (!workbook) throw new NotFoundException('Workbook not found');

  return this.prisma.module2.create({
    data: {
      workbookId,
      userId,
      ...dto,
    },
  });
}

async findOne(workbookId: string, userId: string) {
  const module = await this.prisma.module2.findUnique({
    where: {
      workbookId_userId: {
        workbookId,
        userId,
      },
    },
  });
  if (!module) throw new NotFoundException('Module2 not found for this workbook and user');
  return module;
}

async update(workbookId: string, userId: string, dto: UpdateModule2Dto) {
  await this.findOne(workbookId, userId);
  return this.prisma.module2.update({
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
  return this.prisma.module2.delete({
    where: {
      workbookId_userId: {
        workbookId,
        userId,
      },
    },
  });
}

}
