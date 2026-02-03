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

  // async getOverview(userId: string, period: 'weekly' | 'monthly' | 'yearly') {
  //   const now = new Date();
  //   const rangeMap = {
  //     weekly: subDays(now, 7),
  //     monthly: subMonths(now, 1),
  //     yearly: subYears(now, 1),
  //   };
  //   const fromDate = rangeMap[period];

  //   const [incomes, expenses, budgets] = await Promise.all([
  //     this.prisma.income.findMany({
  //       where: { userId, createdAt: { gte: fromDate } },
  //       include: { category: true },
  //     }),
  //     this.prisma.expense.findMany({
  //       where: { userId, createdAt: { gte: fromDate } },
  //       include: { category: true, budget: true },
  //     }),
  //     this.prisma.budget.findMany({
  //       where: { userId },
  //       include: { category: true, expenses: true },
  //     }),
  //   ]);

  //   const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
  //   const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

  //   const trend = this.generateTrendData(incomes, expenses, period);
  //   const budgetOverview = budgets.map((budget) => {
  //     const spent = budget.expenses.reduce((sum, e) => sum + e.amount, 0);
  //     const percentage = Math.round((spent / budget.limit) * 100);
  //     return {
  //       category: budget.category.title,
  //       icon: budget.category.icon ?? '',
  //       budget: budget.limit,
  //       spent,
  //       percentage: Math.min(percentage, 100),
  //     };
  //   });

  //   return {
  //     summary: {
  //       totalIncome,
  //       totalExpense,
  //       net: totalIncome - totalExpense,
  //     },
  //     trend,
  //     budgetOverview,
  //   };
  // }

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

  // Calculate percentages safely
  const incomePercentage = totalIncome > 0 ? 100 : 0;
  const expensePercentage = totalIncome > 0 ? Math.round((totalExpense / totalIncome) * 100) : 0;

  const trend = this.generateTrendData(incomes, expenses, period);

  const budgetOverview = budgets.map((budget) => {
    const spent = budget.expenses.reduce((sum, e) => sum + e.amount, 0);
    const percentage = Math.round((spent / budget.limit) * 100);
    return {
      category: budget?.category?.title,
      icon: budget?.category?.icon ?? '',
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
      incomePercentage,
      expensePercentage,
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
//   const now = new Date();
//   const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
//   const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
//   const previousMonthEnd = currentMonthStart;

//   // 1Fetch all users (needed for cumulative totals)
//   const allUsers = await this.prisma.user.findMany({
//     select: { createdAt: true },
//     where: { createdAt: { lt: now } },
//   });

//   // Only users created since previous month
//   const users = allUsers.filter((u) => u.createdAt >= previousMonthStart);

//   // Fetch activity logs since previous month
//   const activityLogs = await this.prisma.activityLog.findMany({
//     select: { userId: true, createdAt: true },
//     where: { createdAt: { gte: previousMonthStart, lt: now } },
//   });

//   //Compute summary numbers
//   let newRegistrationsCurrent = 0;
//   let newRegistrationsPrevious = 0;

//   users.forEach((u) => {
//     const date = new Date(u.createdAt);
//     if (date >= currentMonthStart) newRegistrationsCurrent += 1;
//     else newRegistrationsPrevious += 1;
//   });

//   // Active users: unique per month
//   const currentMonthActiveSet = new Set<string>();
//   const previousMonthActiveSet = new Set<string>();
// activityLogs.forEach((a) => {
//   if (!a.userId) return; 
//   const date = new Date(a.createdAt);
//   if (date >= currentMonthStart) currentMonthActiveSet.add(a.userId);
//   else previousMonthActiveSet.add(a.userId);
// });


//   const activeUsersCurrent = currentMonthActiveSet.size;
//   const activeUsersPrevious = previousMonthActiveSet.size;

//   // Total users cumulative
//   const totalUsersCurrent = allUsers.length;
//   const totalUsersPrevious = allUsers.filter((u) => u.createdAt < previousMonthEnd).length;

//   // Helper to compute growth and trend
//   const computeGrowth = (current: number, previous: number) => {
//     const growth = current - previous;
//     const growthPercentage = previous > 0 ? (growth / previous) * 100 : current > 0 ? 100 : 0;
//     const trend = growth > 0 ? 'positive' : growth < 0 ? 'negative' : 'neutral';
//     return {
//       current,
//       previous,
//       growth,
//       growthPercentage: Number(growthPercentage.toFixed(2)),
//       trend,
//     };
//   };

//   // Build daily chart data separately
//   const days = Array.from({ length: 30 }, (_, i) => {
//     const day = new Date();
//     day.setDate(now.getDate() - (29 - i));
//     return {
//       date: day,
//       label: day.toLocaleDateString('default', { day: 'numeric', month: 'short' }),
//     };
//   });

//   const newRegistrationsChart = days.map(({ date, label }) => {
//     const count = users.filter((u) => new Date(u.createdAt).toDateString() === date.toDateString()).length;
//     return { label, value: count };
//   });

//   const activeUsersChart = days.map(({ date, label }) => {
//     const set = new Set(
//       activityLogs
//         .filter((a) => new Date(a.createdAt).toDateString() === date.toDateString())
//         .map((a) => a.userId)
//     );
//     return { label, value: set.size };
//   });

//   const totalUsersChart = days.map(({ date, label }) => {
//     const count = allUsers.filter((u) => u.createdAt <= date).length;
//     return { label, value: count };
//   });

//   //  Return final structured data
//   return {
//     totalUsers: computeGrowth(totalUsersCurrent, totalUsersPrevious),
//     activeUsers: computeGrowth(activeUsersCurrent, activeUsersPrevious),
//     newRegistrations: computeGrowth(newRegistrationsCurrent, newRegistrationsPrevious),
//     charts: {
//       newRegistrations: newRegistrationsChart,
//       activeUsers: activeUsersChart,
//       totalUsers: totalUsersChart,
//     },
//   };
// }

async getMonthlyGrowthChart() {
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // -------------------------------
  // TOTAL USERS (ACTIVE ONLY)
  // -------------------------------
  const totalUsersCurrent = await this.prisma.user.count({
    where: { status: 'ACTIVE' },
  });

  const totalUsersPrevious = await this.prisma.user.count({
    where: {
      status: 'ACTIVE',
      createdAt: { lt: currentMonthStart },
    },
  });

  // -------------------------------
  // NEW REGISTRATIONS
  // -------------------------------
  const newRegistrationsCurrent = await this.prisma.user.count({
    where: {
      status: 'ACTIVE',
      createdAt: { gte: currentMonthStart },
    },
  });

  const newRegistrationsPrevious = await this.prisma.user.count({
    where: {
      status: 'ACTIVE',
      createdAt: {
        gte: previousMonthStart,
        lt: currentMonthStart,
      },
    },
  });

  // -------------------------------
  // ACTIVE USERS (THIS IS THE FIX 🔥)
  // -------------------------------
  const activeUsersCurrent = await this.prisma.user.count({
    where: {
      status: 'ACTIVE',
      OR: [
        // created this month
        { createdAt: { gte: currentMonthStart } },

        // OR had activity this month
        {
          ActivityLog: {
            some: {
              createdAt: { gte: currentMonthStart },
            },
          },
        },
      ],
    },
  });

  const activeUsersPrevious = await this.prisma.user.count({
    where: {
      status: 'ACTIVE',
      OR: [
        {
          createdAt: {
            gte: previousMonthStart,
            lt: currentMonthStart,
          },
        },
        {
          ActivityLog: {
            some: {
              createdAt: {
                gte: previousMonthStart,
                lt: currentMonthStart,
              },
            },
          },
        },
      ],
    },
  });

  // -------------------------------
  // GROWTH HELPER
  // -------------------------------
  const computeGrowth = (current: number, previous: number) => {
    const growth = current - previous;
    const growthPercentage =
      previous > 0 ? (growth / previous) * 100 : current > 0 ? 100 : 0;

    return {
      current,
      previous,
      growth,
      growthPercentage: Number(growthPercentage.toFixed(2)),
      trend:
        growth > 0 ? 'positive' : growth < 0 ? 'negative' : 'neutral',
    };
  };

  // -------------------------------
  // DAILY CHARTS (LAST 30 DAYS)
  // -------------------------------
  const days = Array.from({ length: 30 }, (_, i) => {
    const day = new Date();
    day.setDate(now.getDate() - (29 - i));
    return {
      date: day,
      label: day.toLocaleDateString('default', {
        day: 'numeric',
        month: 'short',
      }),
    };
  });

  const newRegistrationsChart = await Promise.all(
    days.map(async ({ date, label }) => {
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);

      const value = await this.prisma.user.count({
        where: {
          status: 'ACTIVE',
          createdAt: {
            gte: date,
            lt: nextDay,
          },
        },
      });

      return { label, value };
    })
  );

  const activeUsersChart = await Promise.all(
    days.map(async ({ date, label }) => {
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);

      const value = await this.prisma.user.count({
        where: {
          status: 'ACTIVE',
          OR: [
            {
              createdAt: {
                gte: date,
                lt: nextDay,
              },
            },
            {
              ActivityLog: {
                some: {
                  createdAt: {
                    gte: date,
                    lt: nextDay,
                  },
                },
              },
            },
          ],
        },
      });

      return { label, value };
    })
  );

  const totalUsersChart = await Promise.all(
    days.map(async ({ date, label }) => {
      const value = await this.prisma.user.count({
        where: {
          status: 'ACTIVE',
          createdAt: { lte: date },
        },
      });

      return { label, value };
    })
  );

  // -------------------------------
  // FINAL RESPONSE
  // -------------------------------
  return {
    totalUsers: computeGrowth(totalUsersCurrent, totalUsersPrevious),
    activeUsers: computeGrowth(activeUsersCurrent, activeUsersPrevious),
    newRegistrations: computeGrowth(
      newRegistrationsCurrent,
      newRegistrationsPrevious
    ),
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
        user: { select: { firstname: true, lastname: true, email: true } },
      },
    });
  }



// async getLeaderboard(query: Record<string, string | undefined>) {
//   const {
//     page = '1',
//     limit = '20',
//     search,
//     ranking = 'highest', // lowest or highest
//     sortBy = 'streak',   // default sort field
//   } = query;

//   const pageNum = Number(page);
//   const limitNum = Number(limit);

//   // Fetch users
//   const users = await this.prisma.user.findMany({
//     where: {
//       ...(search
//         ? {
//             OR: [
//               { firstname: { contains: search, mode: 'insensitive' } },
//               { lastname: { contains: search, mode: 'insensitive' } },
//               { email: { contains: search, mode: 'insensitive' } },
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

//   // Build leaderboard
//   const leaderboard = users.map((user) => {
//     const totalProjects = user.projects.length;
//     const totalCompletedGoals = user.projects
//       .flatMap((p) => p.goals)
//       .filter((g) => g.isCompleted).length;
//     const totalSavings = user.savingsGoals.reduce((sum, g) => sum + g.savedAmount, 0);
//     const totalBudget = user.budgets.reduce((sum, b) => sum + b.limit, 0);
//     const consistencyStreak = totalCompletedGoals; // placeholder for streak logic

//     return {
//       id: user.id,
//       name: [user.firstname, user.lastname].filter(Boolean).join(' ') || user.email,
//       projects: totalProjects,
//       completed: totalCompletedGoals,
//       goals: totalCompletedGoals,
//       savings: totalSavings,
//       budget: totalBudget,
//       streak: consistencyStreak,
//     };
//   });

//   // --- Filtering logic ---
//   const filterByRange = (value: number, ranges: [number, number | null][]) => {
//     return ranges.some(([min, max]) => {
//       if (max === null) return value >= min;
//       return value >= min && value <= max;
//     });
//   };

//   let filtered = leaderboard;

//   // 2) Projects Completed
//   if (query.projects) {
//     const projectsFilter: [number, number | null][] =
//       query.projects === '0-20'
//         ? [[0, 20]]
//         : query.projects === '21-50'
//         ? [[21, 50]]
//         : query.projects === '51+'
//         ? [[51, null]]
//         : [];
//     filtered = filtered.filter((u) => filterByRange(u.projects, projectsFilter));
//   }

//   // 3) Goals Completed
//   if (query.goals) {
//     const goalsFilter: [number, number | null][] =
//       query.goals === '0-100'
//         ? [[0, 100]]
//         : query.goals === '101-300'
//         ? [[101, 300]]
//         : query.goals === '301+'
//         ? [[301, null]]
//         : [];
//     filtered = filtered.filter((u) => filterByRange(u.goals, goalsFilter));
//   }

//   // 4) Consistency Streak
//   if (query.streak) {
//     const streakFilter: [number, number | null][] =
//       query.streak === '0-20'
//         ? [[0, 20]]
//         : query.streak === '21-50'
//         ? [[21, 50]]
//         : query.streak === '51+'
//         ? [[51, null]]
//         : [];
//     filtered = filtered.filter((u) => filterByRange(u.streak, streakFilter));
//   }

//   // --- Sorting (ranking) ---
//   const sortField = sortBy as keyof typeof filtered[number];
//   filtered.sort((a, b) => {
//     const aVal = a[sortField];
//     const bVal = b[sortField];

//     if (typeof aVal === 'string' && typeof bVal === 'string') {
//       return ranking === 'lowest'
//         ? aVal.localeCompare(bVal)
//         : bVal.localeCompare(aVal);
//     }

//     return ranking === 'lowest'
//       ? (aVal as number) - (bVal as number)
//       : (bVal as number) - (aVal as number);
//   });

//   // --- Pagination ---
//   const total = filtered.length;
//   const startIndex = (pageNum - 1) * limitNum;
//   const paginated = filtered.slice(startIndex, startIndex + limitNum);

//   return {
//     data: paginated,
//     meta: {
//       page: pageNum,
//       limit: limitNum,
//       total,
//       totalPages: Math.ceil(total / limitNum),
//       sortedBy: sortField,
//       ranking,
//     },
//   };
// }

async getLeaderboard(query: Record<string, string | undefined>) {
  const {
    page = '1',
    limit = '20',
    search,
    ranking = 'highest', 
    sortBy = 'streak',   
    completedMin,
    completedMax,
    goalsMin,
    goalsMax,
    streakMin,
    streakMax,
    savingsMin,
    savingsMax,
    projectsMin,
    projectsMax,
    budgetMin,
    budgetMax,
  } = query;

  const pageNum = Number(page);
  const limitNum = Number(limit);

  // --- 1. Fetch users and related data ---
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
    projects: {
      include: {
        goals: true,   
      },
    },
    savingsGoals: true,
    budgets: true,
  },
});


  // --- 2. Build the leaderboard structure ---
  const leaderboard = users
    .filter(u => u.firstname || u.lastname || u.email) 
    .map((user) => {
      const totalProjects = user.projects.length;
      const totalCompletedGoals = user.projects
        .flatMap((p) => p.goals)
        .filter((g) => g.isCompleted).length;
      const totalSavings = user.savingsGoals.reduce((sum, g) => sum + (g.savedAmount || 0), 0);
      const totalBudget = user.budgets.reduce((sum, b) => sum + (b.limit || 0), 0);
      const consistencyStreak = totalCompletedGoals; 

      return {
        id: user.id,
        name: [user.firstname, user.lastname].filter(Boolean).join(' ') || user.email,
        projects: totalProjects,
        completed: totalCompletedGoals,
        goals: totalCompletedGoals,
        savings: totalSavings,
        budget: totalBudget,
        streak: consistencyStreak,
      };
    });

  // --- 3. Helper: range filter function ---
  const inRange = (value: number, min?: string, max?: string) => {
    const minVal = min ? Number(min) : undefined;
    const maxVal = max ? Number(max) : undefined;
    if (minVal !== undefined && value < minVal) return false;
    if (maxVal !== undefined && value > maxVal) return false;
    return true;
  };

  // --- 4. Apply optional numeric filters ---
  let filtered = leaderboard.filter((u) =>
    inRange(u.completed, completedMin, completedMax) &&
    inRange(u.goals, goalsMin, goalsMax) &&
    inRange(u.streak, streakMin, streakMax) &&
    inRange(u.savings, savingsMin, savingsMax) &&
    inRange(u.projects, projectsMin, projectsMax) &&
    inRange(u.budget, budgetMin, budgetMax)
  );

  // --- 5. Sorting logic (default highest first) ---
  const sortField = sortBy as keyof typeof filtered[number];
  filtered.sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return ranking === 'lowest'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    return ranking === 'lowest'
      ? (aVal as number) - (bVal as number)
      : (bVal as number) - (aVal as number);
  });

  // --- 6. Pagination ---
  const total = filtered.length;
  const startIndex = (pageNum - 1) * limitNum;
  const paginated = filtered.slice(startIndex, startIndex + limitNum);

  return {
    data: paginated,
    meta: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
      sortedBy: sortField,
      ranking,
    },
  };
}


}
