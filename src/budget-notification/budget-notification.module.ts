import { Module } from '@nestjs/common';
import { BudgetNotificationService } from './budget-notification.service';
import { BudgetNotificationController } from './budget-notification.controller';
import { BudgetNotificationCronService } from './budget-notification-cron.service';

@Module({
  controllers: [BudgetNotificationController],
  providers: [BudgetNotificationService, BudgetNotificationCronService],
})
export class BudgetNotificationModule {}
