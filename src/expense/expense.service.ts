import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { getDateRange } from 'src/helpers/date-utils';

@Injectable()
export class ExpenseService {
  constructor(private prisma: PrismaService) {}

async create(userId: string, dto: CreateExpenseDto) {
  return this.prisma.$transaction(async (prisma) => {
    // Step 1: Validate amount
    if (dto.amount === undefined || dto.amount <= 0) {
      throw new BadRequestException('A valid expense amount is required');
    }

    // Step 2: Fetch user's wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    // Step 3: Check if wallet has sufficient balance
    if (wallet.balance < dto.amount) {
      throw new BadRequestException('Insufficient wallet balance for this expense');
    }

    // Step 4: Deduct the expense from wallet
    await prisma.wallet.update({
      where: { userId },
      data: {
        balance: {
          decrement: dto.amount,
        },
      },
    });

    // Step 5: Create expense
    const expense = await prisma.expense.create({
      data: {
        userId,
        amount: dto.amount,
        description: dto.description,
        categoryId: dto.categoryId,
        budgetId: dto.budgetId, // optional
      },
    });

    return expense;
  });
}


  async findAll(userId: string) {
    return this.prisma.expense.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const expense = await this.prisma.expense.findFirst({
      where: { id, userId },
      include: { category: true },
    });
    if (!expense) throw new NotFoundException('Expense not found');
    return expense;
  }

  async update(id: string, userId: string, dto: UpdateExpenseDto) {
    await this.findOne(id, userId); // Ensure the expense exists
    return this.prisma.expense.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId); // Ensure the expense exists
    return this.prisma.expense.delete({ where: { id } });
  }

  async getExpenseAnalytics(userId: string, filter: 'weekly' | 'monthly' | 'yearly') {
  const { startDate, endDate } = getDateRange(filter);

  const expenses = await this.prisma.expense.findMany({
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

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  const categorySummary = expenses.reduce((acc, e) => {
    const key = e.categoryId;
    if (!acc[key]) {
      acc[key] = {
        icon: e.category.icon ?? 'default-icon.png', // Fallback icon if none provided
        title: e.category.title,
        amount: 0,
      };
    }
    acc[key].amount += e.amount;
    return acc;
  }, {} as Record<string, { icon: string; title: string; amount: number }>);

  const list = Object.values(categorySummary).map((item) => ({
    ...item,
    percentage: parseFloat(((item.amount / totalAmount) * 100).toFixed(2)),
  }));

  return {
    totalAmount,
    list,
    chart: expenses.map((e) => ({
      label: e.createdAt.toISOString().split('T')[0],
      amount: e.amount,
    })),
  };
}

}
