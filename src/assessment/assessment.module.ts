import { Module } from '@nestjs/common';
import { AssessmentController } from './assessment.controller';
import { AssessmentService } from './assessment.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [AssessmentController],
  providers: [AssessmentService, PrismaService],
})
export class AssessmentModule {}
