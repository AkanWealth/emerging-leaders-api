import { Module } from '@nestjs/common';
import { SavingsGoalController } from './savings-goal.controller';
import { SavingsGoalService } from './savings-goal.service';
import { ActivityLogService } from '../activity-log/activity-log.service';

@Module({
  controllers: [SavingsGoalController],
  providers: [SavingsGoalService, ActivityLogService],
})
export class SavingsGoalModule {}
