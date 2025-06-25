import { IsString, IsEnum, IsUUID, IsBoolean, IsOptional, IsArray } from 'class-validator';

export enum QuestionType {
  RADIO = 'RADIO',
  CHECKBOX = 'CHECKBOX',
  SHORT_TEXT = 'SHORT_TEXT',
  LONG_TEXT = 'LONG_TEXT',
}

export class CreateQuestionDto {
  @IsUUID() assessmentId: string;
  @IsString() question: string;
  @IsEnum(QuestionType) type: QuestionType;
  @IsBoolean() @IsOptional() required?: boolean = false;
  @IsArray() @IsOptional() options?: string[];
}
