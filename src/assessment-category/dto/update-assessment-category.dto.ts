import { IsOptional, IsString } from 'class-validator';

export class UpdateAssessmentCategoryDto {
  @IsOptional()
  @IsString()
  name?: string;
}