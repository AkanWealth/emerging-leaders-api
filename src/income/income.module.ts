// src/income/income.module.ts
import { Module } from '@nestjs/common';
import { IncomeService } from './income.service';
import { IncomeController } from './income.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ActivityLogModule } from '../activity-log/activity-log.module'; 

@Module({
  imports: [PrismaModule, ActivityLogModule], 
  controllers: [IncomeController],
  providers: [IncomeService],
})
export class IncomeModule {}
