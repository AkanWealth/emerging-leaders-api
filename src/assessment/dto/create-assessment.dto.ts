import { IsEnum, IsNotEmpty, IsString, IsUUID, IsDateString } from 'class-validator';
import { AssessmentStatus } from '@prisma/client';

export class CreateAssessmentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsUUID()
  categoryId: string;

  @IsEnum(AssessmentStatus)
  status: AssessmentStatus;

  
  @IsNotEmpty()
  @IsDateString()
  scheduledFor: string; 
}
