import { IsString, IsEnum, IsUUID, IsBoolean, IsOptional, IsArray, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum QuestionType {
  RADIO = 'RADIO',
  CHECKBOX = 'CHECKBOX',
  SHORT_TEXT = 'SHORT_TEXT',
  LONG_TEXT = 'LONG_TEXT',
}

export class CreateQuestionDto {
  @ApiProperty({
    description: 'UUID of the assessment this question belongs to',
    example: 'b1234567-89ab-cdef-0123-456789abcdef',
  })
  @IsUUID()
  assessmentId: string;

  @ApiProperty({
    description: 'The question text',
    example: 'What is your favorite programming language?',
  })
  @IsString()
  question: string;

  @ApiProperty({
    description: 'The type of the question',
    enum: QuestionType,
    example: QuestionType.RADIO,
  })
  @IsEnum(QuestionType)
  type: QuestionType;

  @ApiPropertyOptional({
    description: 'Whether answering the question is required',
    default: false,
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  required?: boolean = false;

  @IsInt()
  @IsOptional()
  order?: number;

  @ApiPropertyOptional({
    description: 'Options for RADIO or CHECKBOX types (not required for text types)',
    example: ['JavaScript', 'Python', 'Java'],
    type: [String],
  })
  @IsArray()
  @IsOptional()
  options?: string[];
}
