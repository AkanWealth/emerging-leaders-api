import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateProjectDto) {
    return this.prisma.project.create({ data: { ...dto, startDate: new Date(dto.startDate), endDate: new Date(dto.endDate) } });
  }

  findAll() {
    return this.prisma.project.findMany({ include: { category: true, goals: true } });
  }

  findOne(id: string) {
    return this.prisma.project.findUnique({ where: { id }, include: { category: true, goals: true } });
  }

  update(id: string, dto: CreateProjectDto) {
    return this.prisma.project.update({
      where: { id },
      data: { ...dto, startDate: new Date(dto.startDate), endDate: new Date(dto.endDate) },
    });
  }

  remove(id: string) {
    return this.prisma.project.delete({ where: { id } });
  }
}
