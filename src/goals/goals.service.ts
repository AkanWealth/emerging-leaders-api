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

  async update(id: string, dto: CreateGoalDto) {
    const goal = await this.prisma.goal.findUnique({ where: { id } });
    if (!goal) throw new NotFoundException('Goal not found');

    const updatedGoal = await this.prisma.goal.update({
      where: { id },
      data: {
        title: dto.title,
        repeat: dto.repeat,
        isCompleted: dto.isCompleted ?? goal.isCompleted,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        startTime: dto.startTime,
        endTime: dto.endTime,
        projectId: dto.projectId,
      },
    });

    if (dto.isCompleted && goal.repeat) {
      const repeatPattern = goal.repeat.toLowerCase();
      let nextStart = new Date(goal.startDate);
      let nextEnd = new Date(goal.endDate);

      if (repeatPattern === 'daily') {
        nextStart = addDays(nextStart, 1);
        nextEnd = addDays(nextEnd, 1);
      } else if (repeatPattern === 'weekly') {
        nextStart = addWeeks(nextStart, 1);
        nextEnd = addWeeks(nextEnd, 1);
      } else if (repeatPattern === 'monthly') {
        nextStart = addMonths(nextStart, 1);
        nextEnd = addMonths(nextEnd, 1);
      }

      await this.prisma.goal.create({
        data: {
          title: goal.title,
          repeat: goal.repeat,
          isCompleted: false,
          startDate: nextStart,
          endDate: nextEnd,
          startTime: goal.startTime,
          endTime: goal.endTime,
          projectId: goal.projectId,
        },
      });
    }

    return updatedGoal;
  }

  async remove(id: string) {
    return this.prisma.goal.delete({
      where: { id },
    });
  }
}
