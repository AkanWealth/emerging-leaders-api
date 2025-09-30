import { Module } from '@nestjs/common';
import { AssessmentController } from './assessment.controller';
import { AssessmentService } from './assessment.service';
import { NotificationsService } from 'src/notifications/notifications.service';

@Module({
  controllers: [AssessmentController],
  providers: [AssessmentService, NotificationsService],
})
export class AssessmentModule {}
