import { IsString, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitAssessmentResponseDto {
  @ApiProperty({
    description: 'CUID of the assessment being submitted',
    example: 'cmlgr5hu90001uad01d4nwcoi',
  })
  @IsString()
  assessmentId: string;

  @ApiProperty({
    description:
      'Answers to the assessment questions. Key is questionId (CUID), value is the submitted answer.',
    example: {
      cmlgq2abc0002uad0xyz1234: 'JavaScript',
      cmlgq2def0003uad0xyz5678: ['Node.js', 'React'],
    },
  })
  @IsObject()
  answers: Record<string, any>;
}
