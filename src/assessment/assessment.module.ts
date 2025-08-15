import { Module } from '@nestjs/common';
import { AssessmentController } from './assessment.controller';
import { AssessmentService } from './assessment.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationsService } from 'src/notifications/notifications.service';

@Module({
  controllers: [AssessmentController],
  providers: [AssessmentService, PrismaService, NotificationsService],
})
export class AssessmentModule {}
