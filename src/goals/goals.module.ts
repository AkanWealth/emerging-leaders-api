import { Module } from '@nestjs/common';
import { GoalService } from './goals.service';
import { GoalsController } from './goals.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [GoalsController],
  providers: [GoalService, PrismaService],
})
export class GoalsModule {}
