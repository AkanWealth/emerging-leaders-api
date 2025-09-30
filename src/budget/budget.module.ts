import { Module } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { ActivityLogService } from '../activity-log/activity-log.service';

@Module({
  providers: [
    BudgetService,
    ActivityLogService, 
  ],
  exports: [BudgetService], 
})
export class BudgetModule {}
