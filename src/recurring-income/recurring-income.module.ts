// src/recurring-income/recurring-income.module.ts
import { Module } from '@nestjs/common';
import { RecurringIncomeService } from './recurring-income.service';
import { RecurringIncomeController } from './recurring-income.controller';
import { RecurringIncomeCronService } from '../recurring-income-cron/recurring-income-cron.service';
import { MailService } from '../mail/mail.service';

@Module({
  imports: [], // 👈 FIX: Make sure PrismaModule is here
  controllers: [RecurringIncomeController],
  providers: [RecurringIncomeService, RecurringIncomeCronService, MailService],
})
export class RecurringIncomeModule {}
