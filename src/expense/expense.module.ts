import { Module } from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { ExpenseController } from './expense.controller';
import { ActivityLogService } from '../activity-log/activity-log.service';

@Module({
  controllers: [ExpenseController],
  providers: [ExpenseService, ActivityLogService],
})
export class ExpenseModule {}
