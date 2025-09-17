// src/analytics/analytics.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { subDays, subMonths, subYears, format } from 'date-fns';

 interface LeaderboardQuery {
  page?: number;
  limit?: number;
  search?: string;
  ranking?: 'lowest' | 'highest';
  completed?: string;
  goals?: string;
  streak?: string;
}


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


// async getMonthlyGrowthChart() {
//     const now = new Date();
//     const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
//     const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
//     const previousMonthEnd = currentMonthStart;

//     // 1. Fetch new registrations grouped by month
//     const registrations = await this.prisma.user.groupBy({
//       by: ['createdAt'],
//       _count: { id: true },
//       where: {
//         createdAt: { gte: previousMonthStart, lt: now },
//       },
//     });

//     // 2. Fetch active users grouped by month from activity logs
//     const activeUsersRaw = await this.prisma.activityLog.groupBy({
//       by: ['userId', 'createdAt'],
//       _count: { userId: true },
//       where: { createdAt: { gte: previousMonthStart, lt: now } },
//     });

//     // 3. Compute totals for charts
//     let newRegistrationsCurrent = 0;
//     let newRegistrationsPrevious = 0;
//     let activeUsersCurrent = 0;
//     let activeUsersPrevious = 0;

//     registrations.forEach((r) => {
//       const date = new Date(r.createdAt);
//       if (date >= currentMonthStart) newRegistrationsCurrent += r._count.id;
//       else newRegistrationsPrevious += r._count.id;
//     });

//     // Active users: count unique userIds
//     const currentMonthIds = new Set<string>();
//     const previousMonthIds = new Set<string>();
//     activeUsersRaw.forEach((a) => {
//       const date = new Date(a.createdAt);
//       if (date >= currentMonthStart) currentMonthIds.add(a.userId);
//       else previousMonthIds.add(a.userId);
//     });
//     activeUsersCurrent = currentMonthIds.size;
//     activeUsersPrevious = previousMonthIds.size;

//     // Total users
//     const totalUsersCurrent = await this.prisma.user.count({ where: { createdAt: { lt: now } } });
//     const totalUsersPrevious = await this.prisma.user.count({ where: { createdAt: { lt: previousMonthEnd } } });

//     // Helper to compute growth, percentage, and trend
//     const computeGrowth = (current: number, previous: number) => {
//       const growth = current - previous;
//       const growthPercentage =
//         previous > 0 ? (growth / previous) * 100 : current > 0 ? 100 : 0;
//       const trend = growth > 0 ? 'positive' : growth < 0 ? 'negative' : 'neutral';
//       return {
//         current,
//         previous,
//         growth,
//         growthPercentage: Number(growthPercentage.toFixed(2)),
//         trend,
//       };
//     };

//     // Build chart data per day for last 30 days
//     const days = Array.from({ length: 30 }, (_, i) => {
//       const day = new Date();
//       day.setDate(now.getDate() - (29 - i));
//       const label = day.toLocaleDateString('default', { day: 'numeric', month: 'short' });

//       const registrationCount = registrations
//         .filter((r) => new Date(r.createdAt).toDateString() === day.toDateString())
//         .reduce((sum, r) => sum + r._count.id, 0);

//       const activeCount = activeUsersRaw
//         .filter((a) => new Date(a.createdAt).toDateString() === day.toDateString())
//         .reduce((sum, a) => sum + 1, 0); // each activity log counts as 1 (unique users already counted above)

//       return { label, newRegistrations: registrationCount, activeUsers: activeCount };
//     });

//     return {
//       totalUsers: computeGrowth(totalUsersCurrent, totalUsersPrevious),
//       activeUsers: computeGrowth(activeUsersCurrent, activeUsersPrevious),
//       newRegistrations: computeGrowth(newRegistrationsCurrent, newRegistrationsPrevious),
//       chartData: days,
//     };
//   }

async getMonthlyGrowthChart() {
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonthEnd = currentMonthStart;

  // 1️⃣ Fetch all users (needed for cumulative totals)
  const allUsers = await this.prisma.user.findMany({
    select: { createdAt: true },
    where: { createdAt: { lt: now } },
  });

  // Only users created since previous month
  const users = allUsers.filter((u) => u.createdAt >= previousMonthStart);

  // 2️⃣ Fetch activity logs since previous month
  const activityLogs = await this.prisma.activityLog.findMany({
    select: { userId: true, createdAt: true },
    where: { createdAt: { gte: previousMonthStart, lt: now } },
  });

  // 3️⃣ Compute summary numbers
  let newRegistrationsCurrent = 0;
  let newRegistrationsPrevious = 0;

  users.forEach((u) => {
    const date = new Date(u.createdAt);
    if (date >= currentMonthStart) newRegistrationsCurrent += 1;
    else newRegistrationsPrevious += 1;
  });

  // Active users: unique per month
  const currentMonthActiveSet = new Set<string>();
  const previousMonthActiveSet = new Set<string>();
  activityLogs.forEach((a) => {
    const date = new Date(a.createdAt);
    if (date >= currentMonthStart) currentMonthActiveSet.add(a.userId);
    else previousMonthActiveSet.add(a.userId);
  });

  const activeUsersCurrent = currentMonthActiveSet.size;
  const activeUsersPrevious = previousMonthActiveSet.size;

  // Total users cumulative
  const totalUsersCurrent = allUsers.length;
  const totalUsersPrevious = allUsers.filter((u) => u.createdAt < previousMonthEnd).length;

  // Helper to compute growth and trend
  const computeGrowth = (current: number, previous: number) => {
    const growth = current - previous;
    const growthPercentage = previous > 0 ? (growth / previous) * 100 : current > 0 ? 100 : 0;
    const trend = growth > 0 ? 'positive' : growth < 0 ? 'negative' : 'neutral';
    return {
      current,
      previous,
      growth,
      growthPercentage: Number(growthPercentage.toFixed(2)),
      trend,
    };
  };

  // 4️⃣ Build daily chart data separately
  const days = Array.from({ length: 30 }, (_, i) => {
    const day = new Date();
    day.setDate(now.getDate() - (29 - i));
    return {
      date: day,
      label: day.toLocaleDateString('default', { day: 'numeric', month: 'short' }),
    };
  });

  const newRegistrationsChart = days.map(({ date, label }) => {
    const count = users.filter((u) => new Date(u.createdAt).toDateString() === date.toDateString()).length;
    return { label, value: count };
  });

  const activeUsersChart = days.map(({ date, label }) => {
    const set = new Set(
      activityLogs
        .filter((a) => new Date(a.createdAt).toDateString() === date.toDateString())
        .map((a) => a.userId)
    );
    return { label, value: set.size };
  });

  const totalUsersChart = days.map(({ date, label }) => {
    const count = allUsers.filter((u) => u.createdAt <= date).length;
    return { label, value: count };
  });

  // 5️⃣ Return final structured data
  return {
    totalUsers: computeGrowth(totalUsersCurrent, totalUsersPrevious),
    activeUsers: computeGrowth(activeUsersCurrent, activeUsersPrevious),
    newRegistrations: computeGrowth(newRegistrationsCurrent, newRegistrationsPrevious),
    charts: {
      newRegistrations: newRegistrationsChart,
      activeUsers: activeUsersChart,
      totalUsers: totalUsersChart,
    },
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
//   filterBy?: "projects" | "goals" | "savings" | "budget" | "streak",
// ) {
//   const skip = (page - 1) * limit;

//   const users = await this.prisma.user.findMany({
//     skip,
//     take: limit,
//     where: {
//       ...(search
//         ? {
//             OR: [
//               { name: { contains: search, mode: "insensitive" } },
//               { email: { contains: search, mode: "insensitive" } },
//             ],
//           }
//         : {}),
//     },
//     include: {
//       projects: { include: { goals: true } },
//       savingsGoals: true,
//       budgets: true,
//     },
//   });

//   const leaderboard = users.map((user) => {
//     const totalProjects = user.projects.length;
//     const totalGoals = user.projects.flatMap((p) => p.goals).filter((g) => g.isCompleted).length;
//     const totalSavings = user.savingsGoals.reduce((sum, g) => sum + g.savedAmount, 0);
//     const totalBudget = user.budgets.reduce((sum, b) => sum + b.limit, 0);
//     const consistencyStreak = totalGoals; // placeholder streak logic

//     return {
//       name: `${user.firstname ?? ''} ${user.lastname ?? ''}`.trim(),
//       projects: totalProjects,
//       goals: totalGoals,
//       savings: totalSavings,
//       budget: totalBudget,
//       streak: consistencyStreak,
//     };
//   });

//   // Default sort by streak if no filterBy provided
//   const sortField = filterBy ?? "streak";
//   leaderboard.sort((a, b) => (b[sortField] as number) - (a[sortField] as number));

//   return {
//     data: leaderboard,
//     meta: {
//       page,
//       limit,
//       total: leaderboard.length,
//       sortedBy: sortField,
//     },
//   };
// }
// analytics.service.ts



async getLeaderboard(query: LeaderboardQuery) {
  const { 
    page = 1, 
    limit = 20, 
    search, 
    ranking = 'highest', 
    completed, 
    goals, 
    streak 
  } = query;

  // Fetch users (search filter at DB level only)
  const users = await this.prisma.user.findMany({
    where: {
      ...(search
        ? {
            OR: [
              { firstname: { contains: search, mode: 'insensitive' } },
              { lastname: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
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

  // Build leaderboard dataset
  const leaderboard = users.map((user) => {
    const totalProjects = user.projects.length;
    const totalCompletedGoals = user.projects
      .flatMap((p) => p.goals)
      .filter((g) => g.isCompleted).length;
    const totalSavings = user.savingsGoals.reduce((sum, g) => sum + g.savedAmount, 0);
    const totalBudget = user.budgets.reduce((sum, b) => sum + b.limit, 0);
    const consistencyStreak = totalCompletedGoals; // Replace later with real streak logic

    return {
      id: user.id,
      name: `${user.firstname ?? ''} ${user.lastname ?? ''}`.trim(),
      projects: totalProjects,
      completed: totalCompletedGoals,
      goals: totalCompletedGoals, // alias for clarity
      savings: totalSavings,
      budget: totalBudget,
      streak: consistencyStreak,
    };
  });

  // Apply optional filters
  const applyNumericFilter = (val: string | undefined, actual: number): boolean => {
    if (!val) return true;
    const value = parseInt(val.match(/\d+/)?.[0] || '0', 10);
    if (val.startsWith('lessThan')) return actual < value;
    if (val.startsWith('moreThan')) return actual > value;
    if (val.startsWith('equal')) return actual === value;
    return true;
  };

  const filtered = leaderboard.filter((user) =>
    applyNumericFilter(completed, user.completed) &&
    applyNumericFilter(goals, user.goals) &&
    applyNumericFilter(streak, user.streak)
  );

  // Sorting (default by streak, but can extend easily)
  const sortField: keyof typeof filtered[number] = 'streak';
  filtered.sort((a, b) =>
    ranking === 'lowest'
      ? (a[sortField] as number) - (b[sortField] as number)
      : (b[sortField] as number) - (a[sortField] as number)
  );

  // Paginate AFTER filtering
  const total = filtered.length;
  const startIndex = (page - 1) * limit;
  const paginated = filtered.slice(startIndex, startIndex + limit);

  return {
    data: paginated,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      sortedBy: sortField,
      ranking,
    },
  };
}


}
