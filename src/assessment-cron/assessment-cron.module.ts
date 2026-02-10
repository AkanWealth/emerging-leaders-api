import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AssessmentCronService } from './assessment-cron.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { AssessmentCronJob } from './assessment-cron-job';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [
    AssessmentCronService,
    AssessmentCronJob, 
    NotificationsService,
  ],
  exports: [
    AssessmentCronService, 
  ],
})
export class AssessmentCronModule {}
