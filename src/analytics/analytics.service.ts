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

  async getUserStats() {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [totalUsers, newUsersThisMonth, newUsersLastMonth, activeUsers] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { createdAt: { gte: startOfThisMonth } } }),
      this.prisma.user.count({ where: { createdAt: { gte: startOfLastMonth, lt: startOfThisMonth } } }),
      this.prisma.user.count({ where: { updatedAt: { gte: startOfThisMonth } } }),
    ]);

    const userGrowth = ((newUsersThisMonth - newUsersLastMonth) / (newUsersLastMonth || 1)) * 100;

    return {
      totalUsers,
      newUsersThisMonth,
      newUsersLastMonth,
      activeUsers,
      userGrowthPercent: parseFloat(userGrowth.toFixed(2)),
    };
  }

 async getMonthlyUserGrowthChart(): Promise<{ month: string; count: number }[]> {
  const now = new Date();
  const data: { month: string; count: number }[] = [];

  for (let i = 11; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

    const count = await this.prisma.user.count({
      where: {
        createdAt: {
          gte: start,
          lt: end,
        },
      },
    });

    data.push({
      month: start.toLocaleString('default', { month: 'short' }), // e.g., "Jan", "Feb"
      count,
    });
  }

  return data;
}

  async getRecentActivities(limit = 10) {
    return this.prisma.activityLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
      },
    });
  }

  async getLeaderboard() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        savingsGoals: true,
        projects: {
          include: {
            goals: true,
          },
        },
      },
    });

    const leaderboard = users.map((user) => {
      const totalProjects = user.projects.length;
      const totalGoals = user.projects.flatMap(p => p.goals).filter(g => g.isCompleted).length;
      const consistency = totalGoals; // optionally enhanced with streak tracking logic

      return {
        name: user.name,
        projectsCompleted: totalProjects,
        goalsCompleted: totalGoals,
        consistencyStreak: consistency,
      };
    });

    return leaderboard.sort((a, b) => b.consistencyStreak - a.consistencyStreak);
  }

}
