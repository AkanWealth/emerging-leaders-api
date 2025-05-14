import { Module } from '@nestjs/common';
import { GoalService } from './goals.service';
import { GoalController } from './goals.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [GoalController],
  providers: [GoalService, PrismaService],
})
export class GoalModule {}
