import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AssessmentCronService } from './assessment-cron.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { QuarterlyAssessmentJob } from '../jobs/quarterly-assessment.job';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [AssessmentCronService, NotificationsService, QuarterlyAssessmentJob],
})
export class AssessmentCronModule {} // ✅ Correct name
