// src/recurring-income/recurring-income-cron.module.ts
import { Module } from '@nestjs/common';
import { RecurringIncomeCronService } from './recurring-income-cron.service';
import { MailService } from 'src/mail/mail.service';

@Module({
  imports: [], //  Required to inject PrismaService
  providers: [RecurringIncomeCronService, MailService],
})
export class RecurringIncomeCronModule {}
