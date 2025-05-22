import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

@Injectable()
export class BudgetService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateBudgetDto) {
    return this.prisma.budget.create({
      data: { ...dto, userId },
    });
  }

  async findAll(userId: string) {
    return this.prisma.budget.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const budget = await this.prisma.budget.findFirst({
      where: { id, userId },
      include: { category: true },
    });
    if (!budget) throw new NotFoundException('Budget not found');
    return budget;
  }

  async update(id: string, userId: string, dto: UpdateBudgetDto) {
    const budget = await this.findOne(id, userId);
    return this.prisma.budget.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, userId: string) {
    const budget = await this.findOne(id, userId);
    return this.prisma.budget.delete({ where: { id } });
  }
}
