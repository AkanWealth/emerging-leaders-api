// goal.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { addDays, addWeeks, addMonths } from 'date-fns';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { format, eachDayOfInterval } from 'date-fns';

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


async findByDateAndProject(userId: string, date: string, projectId: string) {
  const targetDate = new Date(date);
  const formatted = format(targetDate, 'yyyy-MM-dd');

  const goals = await this.prisma.goal.findMany({
    where: {
      projectId,
      project: { userId },
      startDate: { lte: targetDate },
      endDate: { gte: targetDate },
    },
    include: { project: true },
    orderBy: { startDate: 'asc' },
  });

  return goals.map(goal => {
    const completedArray = Array.isArray(goal.completedDates)
      ? goal.completedDates
      : (goal.completedDates ? JSON.parse(JSON.stringify(goal.completedDates)) : []);

    return {
      ...goal,
      isCompletedToday: completedArray.includes(formatted),
    };
  });
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
