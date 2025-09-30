import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AssessmentCronService } from './assessment-cron.service';
import { NotificationsService } from 'src/notifications/notifications.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [AssessmentCronService, NotificationsService],
})
export class AssessmentCronModule {} // ✅ Correct name
