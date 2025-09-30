import { Module } from '@nestjs/common';
import { FinanceSetupService } from './finance-setup.service';
import { FinanceSetupController } from './finance-setup.controller';

@Module({
  controllers: [FinanceSetupController],
  providers: [FinanceSetupService],
})
export class FinanceSetupModule {}
