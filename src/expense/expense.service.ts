import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { getDateRange } from 'src/helpers/date-utils';
import { ActivityLogService } from '../activity-log/activity-log.service';

@Injectable()
export class ExpenseService {
  constructor(private prisma: PrismaService, private readonly activityLogService: ActivityLogService,) {}

async create(userId: string, dto: CreateExpenseDto) {
  return this.prisma.$transaction(async (prisma) => {
    if (dto.amount === undefined || dto.amount <= 0) {
      throw new BadRequestException('A valid expense amount is required');
    }

    const wallet = await prisma.wallet.findUnique({ where: { userId } });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    if (wallet.balance < dto.amount) {
      throw new BadRequestException('Insufficient wallet balance');
    }

    await prisma.wallet.update({
      where: { userId },
      data: {
        balance: { decrement: dto.amount },
      },
    });

    const expense = await prisma.expense.create({
      data: {
        userId,
        amount: dto.amount,
        description: dto.description,
        categoryId: dto.categoryId,
        budgetId: dto.budgetId,
      },
    });

    await this.activityLogService.log(userId, `Logged an expense of ₦${dto.amount}`);

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
  const key = e.categoryId ?? 'uncategorized'; // ✅ fallback for null IDs
  const icon = e.category?.icon ?? 'default-icon.png';
  const title = e.category?.title ?? 'Uncategorized';

  if (!acc[key]) {
    acc[key] = {
      icon,
      title,
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
