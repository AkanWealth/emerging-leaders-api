import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';

@Injectable()
export class IncomeService {
  constructor(private prisma: PrismaService) {}

 async create(userId: string, dto: CreateIncomeDto) {
  return await this.prisma.income.create({
    data: {
      userId,
      amount: dto.amount,
      description: dto.description || '',
      categoryId: dto.categoryId,
    },
  });
}


  async findAll(userId: string) {
    return this.prisma.income.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    });
  }

  async findOne(id: string, userId: string) {
    const income = await this.prisma.income.findFirst({
      where: { id, userId },
      include: { category: true },
    });
    if (!income) throw new NotFoundException('Income not found');
    return income;
  }

  async update(id: string, userId: string, dto: UpdateIncomeDto) {
    await this.findOne(id, userId); // ensure exists
    return this.prisma.income.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId); // ensure exists
    return this.prisma.income.delete({ where: { id } });
  }
}
