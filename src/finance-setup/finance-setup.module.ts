import { Module } from '@nestjs/common';
import { FinanceSetupService } from './finance-setup.service';
import { FinanceSetupController } from './finance-setup.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [FinanceSetupController],
  providers: [FinanceSetupService, PrismaService],
})
export class FinanceSetupModule {}
