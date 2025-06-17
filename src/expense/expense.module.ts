import { Module } from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { ExpenseController } from './expense.controller';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityLogService } from '../activity-log/activity-log.service';

@Module({
  controllers: [ExpenseController],
  providers: [ExpenseService, PrismaService, ActivityLogService],
})
export class ExpenseModule {}
