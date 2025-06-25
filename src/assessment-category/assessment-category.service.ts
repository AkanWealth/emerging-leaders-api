// assessment-category.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAssessmentCategoryDto } from './dto/create-assessment-category.dto';
import { UpdateAssessmentCategoryDto } from './dto/update-assessment-category.dto';

@Injectable()
export class AssessmentCategoryService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAssessmentCategoryDto) {
    return this.prisma.assessmentCategory.create({ data: dto });
  }

  async findAll() {
    return this.prisma.assessmentCategory.findMany();
  }

  async findOne(id: string) {
    const category = await this.prisma.assessmentCategory.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async update(id: string, dto: UpdateAssessmentCategoryDto) {
    return this.prisma.assessmentCategory.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    return this.prisma.assessmentCategory.delete({ where: { id } });
  }
}
