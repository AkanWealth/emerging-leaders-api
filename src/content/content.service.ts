// content.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';

@Injectable()
export class ContentService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateContentDto, adminId: string) {
    return this.prisma.content.create({
      data: {
        ...dto,
        authorId: adminId,
      },
    });
  }

  async update(id: string, dto: UpdateContentDto) {
    return this.prisma.content.update({
      where: { id },
      data: { ...dto },
    });
  }

  async delete(id: string) {
    return this.prisma.content.delete({ where: { id } });
  }

  async archive(id: string) {
    return this.prisma.content.update({ where: { id }, data: { status: 'ARCHIVED' } });
  }

  async recover(id: string) {
    return this.prisma.content.update({ where: { id }, data: { status: 'DRAFT' } });
  }

  async publish(id: string) {
    return this.prisma.content.update({ where: { id }, data: { status: 'PUBLISHED' } });
  }

  async getAll() {
    return this.prisma.content.findMany({ include: { author: true, category: true } });
  }
}
