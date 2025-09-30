// assessment-category.module.ts
import { Module } from '@nestjs/common';
import { AssessmentCategoryService } from './assessment-category.service';
import { AssessmentCategoryController } from './assessment-category.controller';

@Module({
  controllers: [AssessmentCategoryController],
  providers: [AssessmentCategoryService],
  exports: [AssessmentCategoryService]
})
export class AssessmentCategoryModule {}
