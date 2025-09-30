import { Module } from '@nestjs/common';
import { SavingsService } from './savings.service';
import { SavingsController } from './savings.controller';
import { MailModule } from 'src/mail/mail.module';
import { ActivityLogService } from 'src/activity-log/activity-log.service';

@Module({
  imports: [
    MailModule,   
  ],
  controllers: [SavingsController],
  providers: [SavingsService, ActivityLogService],
})
export class SavingsModule {}
