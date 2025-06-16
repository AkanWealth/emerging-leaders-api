import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { getDateRange } from 'src/helpers/date-utils';

@Injectable()
export class IncomeService {
  constructor(private prisma: PrismaService) {}

async create(userId: string, dto: CreateIncomeDto) {
  const { amount, description, categoryId } = dto;

  // 1. Ensure wallet exists
  const wallet = await this.prisma.wallet.findUnique({
    where: { userId },
  });

  if (!wallet) {
    throw new NotFoundException('Wallet not found for user');
  }

  // 2. Create the income entry
  const income = await this.prisma.income.create({
    data: {
      userId,
      amount,
      description: description || '',
      categoryId: categoryId || 'default-category-id',
    },
  });

  // 3. Update wallet balance
  await this.prisma.wallet.update({
    where: { userId },
    data: {
      balance: {
        increment: amount,
      },
    },
  });

  return income;
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

  async getIncomeAnalytics(userId: string, filter: 'weekly' | 'monthly' | 'yearly') {
  const { startDate, endDate } = getDateRange(filter);

  const incomes = await this.prisma.income.findMany({
    where: {
      userId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      category: true,
    },
  });

  const totalAmount = incomes.reduce((sum, income) => sum + income.amount, 0);

  const categorySummary = incomes.reduce((acc, income) => {
    const key = income.categoryId;
    if (!acc[key]) {
      acc[key] = {
        icon: income.category.icon ?? "default.png", // Assuming icon exists in category
        title: income.category.title,
        amount: 0,
      };
    }
    acc[key].amount += income.amount;
    return acc;
  }, {} as Record<string, { icon: string; title: string; amount: number }>);

  const list = Object.values(categorySummary).map((item) => ({
    ...item,
    percentage: parseFloat(((item.amount / totalAmount) * 100).toFixed(2)),
  }));

  return {
    totalAmount,
    list, // For UI
    chart: incomes.map((i) => ({
      label: i.createdAt.toISOString().split('T')[0],
      amount: i.amount,
    })),
  };
}

}
