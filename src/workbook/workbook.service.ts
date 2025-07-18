import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkbookDto } from './dto/create-workbook.dto';
import { UpdateWorkbookDto } from './dto/update-workbook.dto';

@Injectable()
export class WorkbookService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateWorkbookDto) {
    return this.prisma.workbook.create({
      data: { title: dto.title },
    });
  }

  async findAll() {
    return this.prisma.workbook.findMany({
      include: {
        module1s: true,
        module2s: true,
        module3s: true,
      },
    });
  }

  async findOne(id: string) {
    const workbook = await this.prisma.workbook.findUnique({
      where: { id },
      include: {
        module1s: true,
        module2s: true,
        module3s: true,
      },
    });

    if (!workbook) throw new NotFoundException('Workbook not found');
    return workbook;
  }

  async update(id: string, dto: UpdateWorkbookDto) {
    await this.findOne(id); // ensure exists
    return this.prisma.workbook.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // ensure exists
    return this.prisma.workbook.delete({
      where: { id },
    });
  }
}
