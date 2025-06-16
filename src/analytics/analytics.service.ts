// src/analytics/analytics.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { subDays, subMonths, subYears, format } from 'date-fns';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getOverview(userId: string, period: 'weekly' | 'monthly' | 'yearly') {
    const now = new Date();
    const rangeMap = {
      weekly: subDays(now, 7),
      monthly: subMonths(now, 1),
      yearly: subYears(now, 1),
    };
    const fromDate = rangeMap[period];

    const [incomes, expenses, budgets] = await Promise.all([
      this.prisma.income.findMany({
        where: { userId, createdAt: { gte: fromDate } },
        include: { category: true },
      }),
      this.prisma.expense.findMany({
        where: { userId, createdAt: { gte: fromDate } },
        include: { category: true, budget: true },
      }),
      this.prisma.budget.findMany({
        where: { userId },
        include: { category: true, expenses: true },
      }),
    ]);

    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

    const trend = this.generateTrendData(incomes, expenses, period);
    const budgetOverview = budgets.map((budget) => {
      const spent = budget.expenses.reduce((sum, e) => sum + e.amount, 0);
      const percentage = Math.round((spent / budget.limit) * 100);
      return {
        category: budget.category.title,
        icon: budget.category.icon ?? '',
        budget: budget.limit,
        spent,
        percentage: Math.min(percentage, 100),
      };
    });

    return {
      summary: {
        totalIncome,
        totalExpense,
        net: totalIncome - totalExpense,
      },
      trend,
      budgetOverview,
    };
  }

  generateTrendData(
    incomes: any[],
    expenses: any[],
    period: 'weekly' | 'monthly' | 'yearly',
  ) {
    const buckets = this.getTimeBuckets(period);
    return buckets.map(({ label, from, to }) => {
      const income = incomes
        .filter((i) => i.createdAt >= from && i.createdAt < to)
        .reduce((sum, i) => sum + i.amount, 0);
      const expense = expenses
        .filter((e) => e.createdAt >= from && e.createdAt < to)
        .reduce((sum, e) => sum + e.amount, 0);
      return { label, income, expense };
    });
  }

getTimeBuckets(period: 'weekly' | 'monthly' | 'yearly'): { label: string; from: Date; to: Date }[] {
  const now = new Date();
  const buckets: { label: string; from: Date; to: Date }[] = [];

  if (period === 'weekly') {
    for (let i = 6; i >= 0; i--) {
      const from = subDays(now, i);
      const to = subDays(now, i - 1);
      buckets.push({ label: format(from, 'EEE'), from, to });
    }
  } else if (period === 'monthly') {
    for (let i = 4; i >= 0; i--) {
      const from = subDays(now, i * 7);
      const to = subDays(now, (i - 1) * 7);
      buckets.push({ label: `Week ${5 - i}`, from, to });
    }
  } else {
    for (let i = 11; i >= 0; i--) {
      const from = subMonths(now, i);
      const to = subMonths(now, i - 1);
      buckets.push({ label: format(from, 'MMM'), from, to });
    }
  }

  return buckets;
}

}
