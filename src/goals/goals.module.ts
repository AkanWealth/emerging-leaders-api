import { Module } from '@nestjs/common';
import { GoalService } from './goals.service';
import { GoalsController } from './goals.controller';
import { ActivityLogService } from '../activity-log/activity-log.service';

@Module({
  controllers: [GoalsController],
  providers: [GoalService, ActivityLogService],
})
export class GoalsModule {}
