import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GoalNotificationService } from './goal-notification.service';
import { GoalNotificationController } from './goal-notification.controller';
import { GoalNotificationCronService } from './goal-notification-cron.service';

@Module({
  controllers: [GoalNotificationController],
  providers: [
    GoalNotificationService,
    GoalNotificationCronService,
    PrismaService,
  ],
})
export class GoalNotificationModule {}
