import { Module } from '@nestjs/common';
import { GoalNotificationService } from './goal-notification.service';
import { GoalNotificationController } from './goal-notification.controller';
import { GoalNotificationCronService } from './goal-notification-cron.service';

@Module({
  controllers: [GoalNotificationController],
  providers: [
    GoalNotificationService,
    GoalNotificationCronService,
    // PrismaService removed — it's global!
  ],
})
export class GoalNotificationModule {}
