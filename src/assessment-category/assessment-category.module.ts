// assessment-category.module.ts
import { Module } from '@nestjs/common';
import { AssessmentCategoryService } from './assessment-category.service';
import { AssessmentCategoryController } from './assessment-category.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [AssessmentCategoryController],
  providers: [AssessmentCategoryService, PrismaService],
  exports: [AssessmentCategoryService]
})
export class AssessmentCategoryModule {}
