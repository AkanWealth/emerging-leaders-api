import { Module } from '@nestjs/common';
import { GoalService } from './goals.service';
import { GoalsController } from './goals.controller';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityLogService } from '../activity-log/activity-log.service';

@Module({
  controllers: [GoalsController],
  providers: [GoalService, PrismaService, ActivityLogService],
})
export class GoalsModule {}
