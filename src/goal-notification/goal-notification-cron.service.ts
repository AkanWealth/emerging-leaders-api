import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GoalNotificationCronService {
  private readonly logger = new Logger(GoalNotificationCronService.name);
  private readonly INACTIVE_DAYS = 7;

  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async handleDailyGoalNotifications() {
    this.logger.log('Running goal notifications...');
    const users = await this.prisma.user.findMany();

    for (const user of users) {
      await this.checkInactiveGoals(user.id);
      await this.checkCompletedGoals(user.id);
    }

    this.logger.log('Goal notifications complete.');
  }

  private async checkInactiveGoals(userId: string) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - this.INACTIVE_DAYS);

    const goals = await this.prisma.goal.findMany({
      where: {
        isCompleted: false,
        updatedAt: { lt: cutoff },
        projects: { userId },
      },
    });

    for (const goal of goals) {
      const exists = await this.prisma.goalNotification.findFirst({
        where: { goalId: goal.id, type: 'GOAL_INACTIVE' },
      });

      if (!exists) {
        await this.prisma.goalNotification.create({
          data: {
            userId,
            goalId: goal.id,
            title: 'Goal Check-in',
            body: 'Go back to your WHY and remember what’s at the heart of all this.',
            type: 'GOAL_INACTIVE',
          },
        });
      }
    }
  }

  private async checkCompletedGoals(userId: string) {
    const goals = await this.prisma.goal.findMany({
      where: { isCompleted: true },
    });

    for (const goal of goals) {
      const exists = await this.prisma.goalNotification.findFirst({
        where: { goalId: goal.id, type: 'GOAL_COMPLETED' },
      });

      if (!exists) {
        await this.prisma.goalNotification.create({
          data: {
            userId,
            goalId: goal.id,
            title: 'Goal Achieved 🎉',
            body: 'Now you’ve completed that goal, what else do you want to achieve?',
            type: 'GOAL_COMPLETED',
          },
        });
      }
    }
  }
}
