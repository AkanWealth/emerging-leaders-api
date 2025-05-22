import { Module } from '@nestjs/common';
import { SavingsGoalController } from './savings-goal.controller';
import { SavingsGoalService } from './savings-goal.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [SavingsGoalController],
  providers: [SavingsGoalService, PrismaService],
})
export class SavingsGoalModule {}
