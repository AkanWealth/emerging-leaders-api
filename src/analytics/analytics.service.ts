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

//  async getMonthlyUserGrowthChart(): Promise<{ month: string; count: number }[]> {
//   const now = new Date();
//   const data: { month: string; count: number }[] = [];

//   for (let i = 11; i >= 0; i--) {
//     const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
//     const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

//     const count = await this.prisma.user.count({
//       where: {
//         createdAt: {
//           gte: start,
//           lt: end,
//         },
//       },
//     });

//     data.push({
//       month: start.toLocaleString('default', { month: 'short' }), // e.g., "Jan", "Feb"
//       count,
//     });
//   }

//   return data;
// }

async getUserGrowthChart(period: '7d' | '30d' | '12m' = '12m') {
  const now = new Date();
  let data: { label: string; count: number }[] = [];
  let previousData: { label: string; count: number }[] = [];
  let startDate: Date;
  let previousStartDate: Date;
  let previousEndDate: Date;

  if (period === '7d') {
    startDate = new Date(now);
    startDate.setDate(now.getDate() - 6);

    previousStartDate = new Date(startDate);
    previousStartDate.setDate(startDate.getDate() - 7);
    previousEndDate = new Date(startDate);

    // Current 7 days
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i + 1);

      const count = await this.prisma.user.count({
        where: { createdAt: { gte: dayStart, lt: dayEnd } },
      });

      const label = dayStart.toLocaleDateString('default', { day: 'numeric', month: 'short' });
      data.push({ label, count });
    }

    // Previous 7 days
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(previousEndDate.getFullYear(), previousEndDate.getMonth(), previousEndDate.getDate() - i);
      const dayEnd = new Date(previousEndDate.getFullYear(), previousEndDate.getMonth(), previousEndDate.getDate() - i + 1);

      const count = await this.prisma.user.count({
        where: { createdAt: { gte: dayStart, lt: dayEnd } },
      });

      const label = dayStart.toLocaleDateString('default', { day: 'numeric', month: 'short' });
      previousData.push({ label: `Prev ${label}`, count });
    }

  } else if (period === '30d') {
    startDate = new Date(now);
    startDate.setDate(now.getDate() - 29);

    previousStartDate = new Date(startDate);
    previousStartDate.setDate(startDate.getDate() - 30);
    previousEndDate = new Date(startDate);

    // Current 30 days
    for (let i = 29; i >= 0; i--) {
      const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i + 1);

      const count = await this.prisma.user.count({
        where: { createdAt: { gte: dayStart, lt: dayEnd } },
      });

      const label = dayStart.toLocaleDateString('default', { day: 'numeric', month: 'short' });
      data.push({ label, count });
    }

    // Previous 30 days
    for (let i = 29; i >= 0; i--) {
      const dayStart = new Date(previousEndDate.getFullYear(), previousEndDate.getMonth(), previousEndDate.getDate() - i);
      const dayEnd = new Date(previousEndDate.getFullYear(), previousEndDate.getMonth(), previousEndDate.getDate() - i + 1);

      const count = await this.prisma.user.count({
        where: { createdAt: { gte: dayStart, lt: dayEnd } },
      });

      const label = dayStart.toLocaleDateString('default', { day: 'numeric', month: 'short' });
      previousData.push({ label: `Prev ${label}`, count });
    }

  } else if (period === '12m') {
    startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    previousStartDate = new Date(startDate.getFullYear() - 1, startDate.getMonth(), 1);
    previousEndDate = new Date(startDate);

    // Current 12 months
    for (let i = 11; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const count = await this.prisma.user.count({
        where: { createdAt: { gte: start, lt: end } },
      });

      const label = start.toLocaleString('default', { month: 'short' });
      data.push({ label, count });
    }

    // Previous 12 months
    for (let i = 11; i >= 0; i--) {
      const start = new Date(previousEndDate.getFullYear(), previousEndDate.getMonth() - i, 1);
      const end = new Date(previousEndDate.getFullYear(), previousEndDate.getMonth() - i + 1, 1);

      const count = await this.prisma.user.count({
        where: { createdAt: { gte: start, lt: end } },
      });

      const label = start.toLocaleString('default', { month: 'short' });
      previousData.push({ label: `Prev ${label}`, count });
    }
  }

  // Totals
  const totalUsers = data.reduce((sum, item) => sum + item.count, 0);
  const previousTotal = previousData.reduce((sum, item) => sum + item.count, 0);

  const growth = totalUsers - previousTotal;
  const growthPercentage =
    previousTotal > 0
      ? ((totalUsers - previousTotal) / previousTotal) * 100
      : totalUsers > 0
      ? 100
      : 0;

  let trend: 'positive' | 'negative' | 'neutral' = 'neutral';
  if (growth > 0) trend = 'positive';
  else if (growth < 0) trend = 'negative';

  return {
    period,
    totalUsers,
    previousTotal,
    growth,
    growthPercentage: Number(growthPercentage.toFixed(2)),
    trend,
    data,
    previousData,
  };
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

// async getLeaderboard(
//   page = 1,
//   limit = 20,
//   search?: string,
//   filter?: { completedGoals?: boolean; minSavings?: number },
// ) {
//   const skip = (page - 1) * limit;

//   const users = await this.prisma.user.findMany({
//     skip,
//     take: limit,
//     where: {
//       ...(search
//         ? {
//             OR: [
//               { name: { contains: search, mode: 'insensitive' } },
//               { email: { contains: search, mode: 'insensitive' } },
//             ],
//           }
//         : {}),
//       ...(filter?.completedGoals !== undefined
//         ? { savingsGoals: { some: { isCompleted: filter.completedGoals } } }
//         : {}),
//       ...(filter?.minSavings !== undefined
//         ? { savingsGoals: { some: { savedAmount: { gte: filter.minSavings } } } }
//         : {}),
//     },
//     include: {
//       projects: {
//         include: {
//           goals: true,
//         },
//       },
//       savingsGoals: true,
//       budgets: true,
//     },
//   });

//  const leaderboard = users.map((user) => {
//   const totalProjects = user.projects.length;
//   const totalGoals = user.projects.flatMap((p) => p.goals).filter((g) => g.isCompleted).length;
//   const totalSavings = user.savingsGoals.reduce((sum, g) => sum + g.savedAmount, 0);
//   const totalBudget = user.budgets.reduce((sum, b) => sum + b.limit, 0); // ✅ fixed
//   const consistencyStreak = totalGoals; // placeholder until you define real streak logic

//   return {
//     name: user.name,
//     projects: totalProjects,
//     goals: totalGoals,
//     savings: totalSavings,
//     budget: totalBudget,
//     streak: consistencyStreak,
//   };
// });


//   // Sort from highest → lowest streak
//   leaderboard.sort((a, b) => b.streak - a.streak);

//   return {
//     data: leaderboard,
//     meta: {
//       page,
//       limit,
//       total: leaderboard.length,
//     },
//   };
// }


async getLeaderboard(
  page = 1,
  limit = 20,
  search?: string,
  filterBy?: "projects" | "goals" | "savings" | "budget" | "streak",
) {
  const skip = (page - 1) * limit;

  const users = await this.prisma.user.findMany({
    skip,
    take: limit,
    where: {
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      projects: { include: { goals: true } },
      savingsGoals: true,
      budgets: true,
    },
  });

  const leaderboard = users.map((user) => {
    const totalProjects = user.projects.length;
    const totalGoals = user.projects.flatMap((p) => p.goals).filter((g) => g.isCompleted).length;
    const totalSavings = user.savingsGoals.reduce((sum, g) => sum + g.savedAmount, 0);
    const totalBudget = user.budgets.reduce((sum, b) => sum + b.limit, 0);
    const consistencyStreak = totalGoals; // placeholder streak logic

    return {
      name: `${user.firstname ?? ''} ${user.lastname ?? ''}`.trim(),
      projects: totalProjects,
      goals: totalGoals,
      savings: totalSavings,
      budget: totalBudget,
      streak: consistencyStreak,
    };
  });

  // Default sort by streak if no filterBy provided
  const sortField = filterBy ?? "streak";
  leaderboard.sort((a, b) => (b[sortField] as number) - (a[sortField] as number));

  return {
    data: leaderboard,
    meta: {
      page,
      limit,
      total: leaderboard.length,
      sortedBy: sortField,
    },
  };
}

}
