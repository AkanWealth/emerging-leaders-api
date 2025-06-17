import { Module } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [
    BudgetService,
    ActivityLogService, 
    PrismaService,
  ],
  exports: [BudgetService], // optional
})
export class BudgetModule {}
