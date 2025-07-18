import { PartialType } from '@nestjs/mapped-types';
import { CreateAssessmentDto } from './create-assessment.dto';
import { IsDateString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAssessmentDto extends PartialType(CreateAssessmentDto) {
  @ApiPropertyOptional({
    description: 'New scheduled date and time for the assessment in ISO format',
    example: '2025-08-15T14:30:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  scheduledFor?: string;
}
