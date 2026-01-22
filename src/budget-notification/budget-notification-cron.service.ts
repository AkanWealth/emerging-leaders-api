import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { BudgetNotificationService } from './budget-notification.service';

@Injectable()
export class BudgetNotificationCronService {
  private readonly logger = new Logger(BudgetNotificationCronService.name);

  constructor(
    private prisma: PrismaService,
    private budgetService: BudgetNotificationService
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async handleDailyBudgetNotifications() {
    this.logger.log('Running daily budget notifications...');

    const users = await this.prisma.user.findMany();

    for (const user of users) {
      const messages = await this.budgetService.getTodayMessages(user.id);

      for (const msg of messages) {
        const exists = await this.prisma.budgetNotification.findFirst({
          where: {
            userId: user.id,
            savingsGoalId: msg.savingsGoalId,
            budgetId: msg.budgetId,
            type: msg.type,
          },
        });

        if (!exists) {
          await this.prisma.budgetNotification.create({
            data: {
              userId: user.id,
              savingsGoalId: msg.savingsGoalId,
              budgetId: msg.budgetId,
              title: msg.title,
              body: msg.body,
              type: msg.type,
            },
          });
        }
      }
    }

    this.logger.log('Daily budget notifications complete.');
  }
}
