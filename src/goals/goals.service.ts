// goal.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { format, startOfDay, endOfDay, eachDayOfInterval, isSameDay, isAfter, isBefore } from 'date-fns';

type ProjectType = {
  id: string;
  name: string;
  description?: string;
  completed?: boolean;
  startDate?: Date;
  endDate?: Date;
  categoryId?: string | null;
  userId?: string | null;
  projectColor?: string;
  createdAt: Date;
  updatedAt: Date;
};

type GoalType = {
  id: string;
  title: string;
  repeat: 'daily' | 'weekly' | 'monthly' | 'yearly' | null;
  isRepeatEnabled: boolean;
  startDate: Date;
  endDate: Date;
  startTime?: string;
  endTime?: string;
  projectId: string;
  completedDates: string[];
  icon?: string;
  project?: ProjectType | null;
};

type ExpandedGoal = GoalType & {
  currentDate: string;
  isCompletedToday: boolean;
};

@Injectable()
export class GoalService {
  constructor(private prisma: PrismaService, private readonly activityLogService: ActivityLogService,) {}

  async autoCompletePastGoals() {
    const now = new Date();
    return this.prisma.goal.updateMany({
      where: {
        endDate: { lt: now },
        isCompleted: false,
      },
      data: {
        isCompleted: true,
      },
    });
  }

// async create(userId: string, dto: CreateGoalDto) {
//   const goal = await this.prisma.goal.create({
//     data: {
//       title: dto.title,
//       repeat: dto.repeat,
//       isRepeatEnabled: dto.isRepeatEnabled ?? false,
//       isCompleted: dto.isCompleted ?? false,
//       startDate: new Date(dto.startDate),
//       endDate: new Date(dto.endDate),
//       startTime: dto.startTime,
//       endTime: dto.endTime,
//       projectId: dto.projectId,
//       icon: dto.icon ?? 'https://cdn.app/icons/goal-check.png',
//     },
//   });

//   await this.activityLogService.log(userId, `Created goal: ${dto.title}`);
//   return goal;
// }

async create(userId: string, dto: CreateGoalDto) {
  // 1️⃣ Fetch the project to get its end date
  const project = await this.prisma.project.findUnique({
    where: { id: dto.projectId },
  });

  if (!project) throw new NotFoundException('Project not found');

  // 2️⃣ Set goal end date same as project end date
  const endDate = project.endDate;

  // 3️⃣ Keep endTime same as startTime (repeats daily)
  const endTime = dto.startTime;

  // 4️⃣ Create the goal
  const goal = await this.prisma.goal.create({
    data: {
      title: dto.title,
      repeat: dto.repeat,
      isRepeatEnabled: dto.isRepeatEnabled ?? false,
      isCompleted: dto.isCompleted ?? false,
      startDate: new Date(dto.startDate),
      endDate: endDate, // ✅ project end date
      startTime: dto.startTime,
      endTime: endTime, // ✅ same as start time
      projectId: dto.projectId,
      icon: dto.icon ?? 'https://cdn.app/icons/goal-check.png',
    },
  });

  // 5️⃣ Log the creation
  await this.activityLogService.log(userId, `Created goal: ${dto.title}`);

  return goal;
}


  async findAll() {
    await this.autoCompletePastGoals();
    return this.prisma.goal.findMany({
      include: {
        project: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.goal.findUnique({
      where: { id },
      include: {
        project: true,
      },
    });
  }


// async findByDateAndProject(userId: string, date: string, projectId: string) {
//   // Parse the target date
//   const targetDate = new Date(date);

//   // Compute start and end of the day in UTC
//   const startOfDay = new Date(targetDate);
//   startOfDay.setUTCHours(0, 0, 0, 0);

//   const endOfDay = new Date(targetDate);
//   endOfDay.setUTCHours(23, 59, 59, 999);

//   const formatted = format(targetDate, 'yyyy-MM-dd');

//   // Fetch goals that are active at any time during the target day
//   const goals = await this.prisma.goal.findMany({
//     where: {
//       projectId,
//       project: { userId },
//       AND: [
//         { startDate: { lte: endOfDay } }, // startDate before end of day
//         { endDate: { gte: startOfDay } }, // endDate after start of day
//       ],
//     },
//     include: { project: true },
//     orderBy: { startDate: 'asc' },
//   });

//   // Map to include isCompletedToday
//   return goals.map(goal => {
//     const completedArray = Array.isArray(goal.completedDates)
//       ? goal.completedDates
//       : goal.completedDates
//       ? JSON.parse(JSON.stringify(goal.completedDates))
//       : [];

//     return {
//       ...goal,
//       isCompletedToday: completedArray.includes(formatted),
//     };
//   });
// }

// end of MutationObserver


// async findByDateAndProject(userId: string, date: string, projectId: string): Promise<ExpandedGoal[]> {
//   const targetDate = new Date(date);
//   const formattedTarget = format(targetDate, 'yyyy-MM-dd');

//   // Fetch all goals for this project and user
//   const rawGoals = await this.prisma.goal.findMany({
//     where: { projectId, project: { userId } },
//     include: { project: true },
//     orderBy: { startDate: 'asc' },
//   });

//   const repeatTypes = ['daily', 'weekly', 'monthly', 'yearly'] as const;

//   const expandedGoals: ExpandedGoal[] = [];

//   for (const goal of rawGoals) {
//     // Skip goals without projectId (shouldn't happen due to where clause, but for type safety)
//     if (!goal.projectId) continue;

//     const completedDates: string[] = Array.isArray(goal.completedDates)
//       ? goal.completedDates
//       : goal.completedDates
//       ? JSON.parse(JSON.stringify(goal.completedDates))
//       : [];

//     // Ensure repeat fits union type
//     const repeat = repeatTypes.includes(goal.repeat as any)
//       ? (goal.repeat as 'daily' | 'weekly' | 'monthly' | 'yearly')
//       : null;

//     const start = new Date(goal.startDate);
//     const end = new Date(goal.endDate || goal.startDate);

//     // Helper function to create ExpandedGoal with proper type conversion
//     const createExpandedGoal = (occurrenceDate: string): ExpandedGoal => ({
//       ...goal,
//       projectId: goal.projectId as string,
//       startTime: goal.startTime ?? undefined,
//       endTime: goal.endTime ?? undefined,
//       icon: goal.icon ?? undefined,
//       completedDates,
//       repeat,
//       currentDate: occurrenceDate,
//       isCompletedToday: completedDates.includes(occurrenceDate),
//     });

//     if (!goal.isRepeatEnabled) {
//       if (isSameDay(targetDate, start)) {
//         expandedGoals.push(createExpandedGoal(formattedTarget));
//       }
//       continue;
//     }

//     // Generate all occurrences for repeating goals
//     let currentDate = new Date(start);
    
//     while (currentDate <= end) {
//       const formattedCurrent = format(currentDate, 'yyyy-MM-dd');
//       let shouldInclude = false;

//       switch (repeat) {
//         case 'daily':
//           shouldInclude = true;
//           break;
//         case 'weekly':
//           shouldInclude = currentDate.getDay() === start.getDay();
//           break;
//         case 'monthly':
//           shouldInclude = currentDate.getDate() === start.getDate();
//           break;
//         case 'yearly':
//           shouldInclude = 
//             currentDate.getDate() === start.getDate() &&
//             currentDate.getMonth() === start.getMonth();
//           break;
//       }

//       if (shouldInclude) {
//         expandedGoals.push(createExpandedGoal(formattedCurrent));
//       }

//       // Increment date based on repeat type
//       switch (repeat) {
//         case 'daily':
//           currentDate.setDate(currentDate.getDate() + 1);
//           break;
//         case 'weekly':
//           currentDate.setDate(currentDate.getDate() + 7);
//           break;
//         case 'monthly':
//           currentDate.setMonth(currentDate.getMonth() + 1);
//           break;
//         case 'yearly':
//           currentDate.setFullYear(currentDate.getFullYear() + 1);
//           break;
//         default:
//           // Exit loop if no valid repeat type
//           currentDate = new Date(end.getTime() + 1);
//       }
//     }
//   }

//   // Sort by currentDate (occurrence date) ascending
//   expandedGoals.sort(
//     (a, b) => new Date(a.currentDate).getTime() - new Date(b.currentDate).getTime(),
//   );

//   return expandedGoals;
// }

async findByDateAndProject(
  userId: string, 
  date: string, 
  projectId: string,
  page: number = 1,
  limit: number = 50
): Promise<{
  data: ExpandedGoal[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> {
  // Parse date as YYYY-MM-DD string for consistent comparison
  const formattedTarget = date; // Should be in format 'YYYY-MM-DD'

  // Fetch all goals for this project and user
  const rawGoals = await this.prisma.goal.findMany({
    where: { projectId, project: { userId } },
    include: { project: true },
    orderBy: { startDate: 'asc' },
  });

  const repeatTypes = ['daily', 'weekly', 'monthly', 'yearly'] as const;

  const expandedGoals: ExpandedGoal[] = [];

  for (const goal of rawGoals) {
    // Skip goals without projectId
    if (!goal.projectId) continue;

    const completedDates: string[] = Array.isArray(goal.completedDates)
      ? goal.completedDates
      : goal.completedDates
      ? JSON.parse(JSON.stringify(goal.completedDates))
      : [];

    // Ensure repeat fits union type
    const repeat = repeatTypes.includes(goal.repeat as any)
      ? (goal.repeat as 'daily' | 'weekly' | 'monthly' | 'yearly')
      : null;

    // Convert to date-only strings for comparison
    const startDateStr = format(new Date(goal.startDate), 'yyyy-MM-dd');
    const endDateStr = format(new Date(goal.endDate || goal.startDate), 'yyyy-MM-dd');
    
    // Create Date objects for day-of-week/month/year checks
    const start = new Date(goal.startDate);
    const targetDate = new Date(date + 'T00:00:00.000Z'); // Force UTC

    // Helper function to create ExpandedGoal with proper type conversion
    const createExpandedGoal = (occurrenceDate: string): ExpandedGoal => ({
      ...goal,
      projectId: goal.projectId as string,
      startTime: goal.startTime ?? undefined,
      endTime: goal.endTime ?? undefined,
      icon: goal.icon ?? undefined,
      completedDates,
      repeat,
      currentDate: occurrenceDate,
      isCompletedToday: completedDates.includes(occurrenceDate),
    });

    // Handle one-off goals
    if (!goal.isRepeatEnabled) {
      if (formattedTarget === startDateStr) {
        expandedGoals.push(createExpandedGoal(formattedTarget));
      }
      continue;
    }

    // Handle repeating goals - check if target date falls within repeat pattern
    if (formattedTarget >= startDateStr && formattedTarget <= endDateStr) {
      let shouldInclude = false;

      switch (repeat) {
        case 'daily':
          shouldInclude = true;
          break;
        case 'weekly':
          shouldInclude = targetDate.getUTCDay() === start.getUTCDay();
          break;
        case 'monthly':
          shouldInclude = targetDate.getUTCDate() === start.getUTCDate();
          break;
        case 'yearly':
          shouldInclude = 
            targetDate.getUTCDate() === start.getUTCDate() &&
            targetDate.getUTCMonth() === start.getUTCMonth();
          break;
      }

      if (shouldInclude) {
        expandedGoals.push(createExpandedGoal(formattedTarget));
      }
    }
  }

  // Sort by startTime if available, then by title
  expandedGoals.sort((a, b) => {
    if (a.startTime && b.startTime) {
      return a.startTime.localeCompare(b.startTime);
    }
    return a.title.localeCompare(b.title);
  });

  // Apply pagination
  const total = expandedGoals.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = expandedGoals.slice(startIndex, endIndex);

  return {
    data: paginatedData,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

async findByDateRangeAndProject(
  userId: string,
  startDate: string,
  endDate: string,
  projectId: string,
  page: number = 1,
  limit: number = 50
): Promise<{
  data: ExpandedGoal[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> {
  // Fetch all goals for this project and user
  const rawGoals = await this.prisma.goal.findMany({
    where: { projectId, project: { userId } },
    include: { project: true },
    orderBy: { startDate: 'asc' },
  });

  const repeatTypes = ['daily', 'weekly', 'monthly', 'yearly'] as const;
  const expandedGoals: ExpandedGoal[] = [];

  // Parse date range
  const rangeStart = new Date(startDate + 'T00:00:00.000Z');
  const rangeEnd = new Date(endDate + 'T00:00:00.000Z');

  for (const goal of rawGoals) {
    if (!goal.projectId) continue;

    const completedDates: string[] = Array.isArray(goal.completedDates)
      ? goal.completedDates
      : goal.completedDates
      ? JSON.parse(JSON.stringify(goal.completedDates))
      : [];

    const repeat = repeatTypes.includes(goal.repeat as any)
      ? (goal.repeat as 'daily' | 'weekly' | 'monthly' | 'yearly')
      : null;

    const goalStart = new Date(goal.startDate);
    const goalEnd = new Date(goal.endDate || goal.startDate);

    const createExpandedGoal = (occurrenceDate: string): ExpandedGoal => ({
      ...goal,
      projectId: goal.projectId as string,
      startTime: goal.startTime ?? undefined,
      endTime: goal.endTime ?? undefined,
      icon: goal.icon ?? undefined,
      completedDates,
      repeat,
      currentDate: occurrenceDate,
      isCompletedToday: completedDates.includes(occurrenceDate),
    });

    // Handle one-off goals
    if (!goal.isRepeatEnabled) {
      const goalStartStr = format(goalStart, 'yyyy-MM-dd');
      if (goalStartStr >= startDate && goalStartStr <= endDate) {
        expandedGoals.push(createExpandedGoal(goalStartStr));
      }
      continue;
    }

    // Handle repeating goals - generate all occurrences in the range
    let currentDate = new Date(Math.max(goalStart.getTime(), rangeStart.getTime()));
    const effectiveEnd = new Date(Math.min(goalEnd.getTime(), rangeEnd.getTime()));

    while (currentDate <= effectiveEnd) {
      let shouldInclude = false;

      switch (repeat) {
        case 'daily':
          shouldInclude = true;
          break;
        case 'weekly':
          shouldInclude = currentDate.getUTCDay() === goalStart.getUTCDay();
          break;
        case 'monthly':
          shouldInclude = currentDate.getUTCDate() === goalStart.getUTCDate();
          break;
        case 'yearly':
          shouldInclude =
            currentDate.getUTCDate() === goalStart.getUTCDate() &&
            currentDate.getUTCMonth() === goalStart.getUTCMonth();
          break;
      }

      if (shouldInclude) {
        const formattedDate = format(currentDate, 'yyyy-MM-dd');
        expandedGoals.push(createExpandedGoal(formattedDate));
      }

      // Increment based on repeat type
      switch (repeat) {
        case 'daily':
          currentDate.setUTCDate(currentDate.getUTCDate() + 1);
          break;
        case 'weekly':
          currentDate.setUTCDate(currentDate.getUTCDate() + 7);
          break;
        case 'monthly':
          currentDate.setUTCMonth(currentDate.getUTCMonth() + 1);
          break;
        case 'yearly':
          currentDate.setUTCFullYear(currentDate.getUTCFullYear() + 1);
          break;
        default:
          currentDate = new Date(effectiveEnd.getTime() + 1);
      }
    }
  }

  // Sort by occurrence date, then by startTime
  expandedGoals.sort((a, b) => {
    const dateCompare = a.currentDate.localeCompare(b.currentDate);
    if (dateCompare !== 0) return dateCompare;
    
    if (a.startTime && b.startTime) {
      return a.startTime.localeCompare(b.startTime);
    }
    return a.title.localeCompare(b.title);
  });

  // Apply pagination
  const total = expandedGoals.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = expandedGoals.slice(startIndex, endIndex);

  return {
    data: paginatedData,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

async update(id: string, dto: UpdateGoalDto) {
  const goal = await this.prisma.goal.findUnique({ where: { id } });
  if (!goal) throw new NotFoundException('Goal not found');

  const today = format(new Date(), 'yyyy-MM-dd');

  // ✅ Ensure completedDates is always an array of strings
  const existingDates: string[] = Array.isArray(goal.completedDates)
    ? (goal.completedDates as string[])
    : [];

  const completed = new Set(existingDates);

  // Add or remove today's date
  if (dto.isCompleted) {
    completed.add(today);
  } else {
    completed.delete(today);
  }

  //  Check if all days in the goal range are completed
  const allDays = eachDayOfInterval({
    start: goal.startDate,
    end: goal.endDate,
  }).map(d => format(d, 'yyyy-MM-dd'));

  const allDone = allDays.every(d => completed.has(d));

  const updatedGoal = await this.prisma.goal.update({
    where: { id },
    data: {
      title: dto.title ?? goal.title,
      repeat: dto.repeat ?? goal.repeat,
      isRepeatEnabled:
        typeof dto.isRepeatEnabled === 'boolean'
          ? dto.isRepeatEnabled
          : goal.isRepeatEnabled,
      completedDates: Array.from(completed), // convert Set back to array
      isCompleted: allDone,
      startDate: dto.startDate ? new Date(dto.startDate) : goal.startDate,
      endDate: dto.endDate ? new Date(dto.endDate) : goal.endDate,
      startTime: dto.startTime ?? goal.startTime,
      endTime: dto.endTime ?? goal.endTime,
      projectId: dto.projectId ?? goal.projectId,
      icon: dto.icon ?? goal.icon,
    },
  });

  return updatedGoal;
}

async getUpcomingGoals(userId: string) {
  const now = new Date();

  return this.prisma.goal.findMany({
    where: {
      isCompleted: false,
      startDate: {
        gte: now,
      },
      project: {
        userId,
      },
    },
    include: {
      project: true,
    },
    orderBy: {
      startDate: 'asc',
    },
  });
}


  async remove(id: string) {
    return this.prisma.goal.delete({
      where: { id },
    });
  }
}
