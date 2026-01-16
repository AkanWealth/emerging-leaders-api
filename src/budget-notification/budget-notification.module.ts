import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BudgetNotificationService } from './budget-notification.service';
import { BudgetNotificationController } from './budget-notification.controller';
import { BudgetNotificationCronService } from './budget-notification-cron.service';

@Module({
  controllers: [BudgetNotificationController],
  providers: [BudgetNotificationService, PrismaService, BudgetNotificationCronService],
})
export class BudgetNotificationModule {}
