import { IsString } from 'class-validator';

export class CreateAssessmentCategoryDto {
  @IsString()
  name: string;
}
