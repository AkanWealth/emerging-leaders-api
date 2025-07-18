import { IsUUID, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitAssessmentResponseDto {
  @ApiProperty({
    description: 'UUID of the assessment being submitted',
    example: '3f5a1e34-8b21-4f43-b5c3-8c2c7f4d72af',
  })
  @IsUUID()
  assessmentId: string;

  @ApiProperty({
    description: 'Answers to the assessment questions. Key is questionId (UUID), value is the submitted answer.',
    example: {
      'a9c3b11f-4b25-491a-bb3f-5d1b7c2e9a10': 'JavaScript',
      'b2f9e512-88e7-4e02-a6c2-ded22f3e8c10': ['Node.js', 'React'],
    },
  })
  @IsObject()
  answers: Record<string, any>;
}
