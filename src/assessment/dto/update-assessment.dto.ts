import { PartialType } from '@nestjs/mapped-types';
import { CreateAssessmentDto } from './create-assessment.dto';
import { IsDateString, IsOptional } from 'class-validator';

export class UpdateAssessmentDto extends PartialType(CreateAssessmentDto) {
  @IsOptional()
  @IsDateString()
  scheduledFor?: string;
}
