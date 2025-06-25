import { IsUUID, IsObject } from 'class-validator';

export class SubmitAssessmentResponseDto {
  @IsUUID()
  assessmentId: string;

  @IsObject()
  answers: Record<string, any>; // key = questionId, value = answer
}
