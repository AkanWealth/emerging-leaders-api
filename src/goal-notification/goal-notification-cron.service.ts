import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { GoalNotificationService } from './goal-notification.service';

@Injectable()
export class GoalNotificationCronService {
  private readonly logger = new Logger(GoalNotificationCronService.name);

  constructor(
    private prisma: PrismaService,
    private goalNotificationService: GoalNotificationService
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async handleDailyGoalNotifications() {
    this.logger.log('Running daily goal notifications...');

    const users = await this.prisma.user.findMany();

    for (const user of users) {
      const messages = await this.goalNotificationService.getTodayMessages(user.id);

      for (const msg of messages) {
        // Avoid duplicate notifications
        const exists = await this.prisma.goalNotification.findFirst({
          where: {
            userId: user.id,
            goalId: msg.goalId,
            projectId: msg.projectId,
            type: msg.type,
          },
        });

        if (!exists) {
          await this.prisma.goalNotification.create({
            data: {
              userId: user.id,
              goalId: msg.goalId,
              projectId: msg.projectId,
              title: msg.title,
              body: msg.body,
              type: msg.type,
            },
          });
        }
      }
    }

    this.logger.log('Daily goal notifications complete.');
  }
}
