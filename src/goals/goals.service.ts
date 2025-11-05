// goal.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { addDays, addWeeks, addMonths } from 'date-fns';
import { ActivityLogService } from '../activity-log/activity-log.service';

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

 async create(userId: string, dto: CreateGoalDto) {
  const goal = await this.prisma.goal.create({
    data: {
      title: dto.title,
      repeat: dto.repeat,
      isCompleted: dto.isCompleted ?? false,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      startTime: dto.startTime,
      endTime: dto.endTime,
      projectId: dto.projectId,
      icon: dto.icon ?? 'https://cdn.app/icons/goal-check.png', // Default icon if not provided
    },
  });

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

  return this.prisma.goal.findMany({
    where: {
      projectId,
      project: {
        userId, // ✅ ensures the project belongs to the current user
      },
      startDate: { lte: targetDate },
      endDate: { gte: targetDate },
    },
    include: {
      project: true,
    },
    orderBy: {
      startDate: 'asc',
    },
  });
}

  // async update(id: string, dto: CreateGoalDto) {
  //   const goal = await this.prisma.goal.findUnique({ where: { id } });
  //   if (!goal) throw new NotFoundException('Goal not found');

  //   const updatedGoal = await this.prisma.goal.update({
  //     where: { id },
  //     data: {
  //       title: dto.title,
  //       repeat: dto.repeat,
  //       isCompleted: dto.isCompleted ?? goal.isCompleted,
  //       startDate: new Date(dto.startDate),
  //       endDate: new Date(dto.endDate),
  //       startTime: dto.startTime,
  //       endTime: dto.endTime,
  //       projectId: dto.projectId,
  //       icon: dto.icon ?? goal.icon, // Use existing icon if not provided
  //     },
  //   });

  //   if (dto.isCompleted && goal.repeat) {
  //     const repeatPattern = goal.repeat.toLowerCase();
  //     let nextStart = new Date(goal.startDate);
  //     let nextEnd = new Date(goal.endDate);

  //     if (repeatPattern === 'daily') {
  //       nextStart = addDays(nextStart, 1);
  //       nextEnd = addDays(nextEnd, 1);
  //     } else if (repeatPattern === 'weekly') {
  //       nextStart = addWeeks(nextStart, 1);
  //       nextEnd = addWeeks(nextEnd, 1);
  //     } else if (repeatPattern === 'monthly') {
  //       nextStart = addMonths(nextStart, 1);
  //       nextEnd = addMonths(nextEnd, 1);
  //     }

  //     await this.prisma.goal.create({
  //       data: {
  //         title: goal.title,
  //         repeat: goal.repeat,
  //         isCompleted: false,
  //         startDate: nextStart,
  //         endDate: nextEnd,
  //         startTime: goal.startTime,
  //         endTime: goal.endTime,
  //         projectId: goal.projectId,
  //         icon: goal.icon, // Use existing icon
  //       },
  //     });
  //   }

  //   return updatedGoal;
  // }

  async update(id: string, dto: CreateGoalDto) {
  const goal = await this.prisma.goal.findUnique({ where: { id } });
  if (!goal) throw new NotFoundException('Goal not found');

  const updatedGoal = await this.prisma.goal.update({
    where: { id },
    data: {
      title: dto.title,
      repeat: dto.repeat,
      isRepeatEnabled: dto.isRepeatEnabled ?? goal.isRepeatEnabled,
      isCompleted: dto.isCompleted ?? goal.isCompleted,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      startTime: dto.startTime,
      endTime: dto.endTime,
      projectId: dto.projectId,
      icon: dto.icon ?? goal.icon,
    },
  });

  // ✅ Only create next goal if repeat is enabled and goal was just completed
  if (dto.isCompleted && goal.isRepeatEnabled && goal.repeat) {
    const repeatPattern = goal.repeat.toLowerCase();
    let nextStart = new Date(goal.startDate);
    let nextEnd = new Date(goal.endDate);

    switch (repeatPattern) {
      case 'daily':
        nextStart = addDays(nextStart, 1);
        nextEnd = addDays(nextEnd, 1);
        break;
      case 'weekly':
        nextStart = addWeeks(nextStart, 1);
        nextEnd = addWeeks(nextEnd, 1);
        break;
      case 'monthly':
        nextStart = addMonths(nextStart, 1);
        nextEnd = addMonths(nextEnd, 1);
        break;
    }

    await this.prisma.goal.create({
      data: {
        title: goal.title,
        repeat: goal.repeat,
        isRepeatEnabled: goal.isRepeatEnabled,
        isCompleted: false,
        startDate: nextStart,
        endDate: nextEnd,
        startTime: goal.startTime,
        endTime: goal.endTime,
        projectId: goal.projectId,
        icon: goal.icon,
      },
    });
  }

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
