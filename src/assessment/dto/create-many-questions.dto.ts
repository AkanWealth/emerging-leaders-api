import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { CreateQuestionDto } from './create-question.dto';

export class BulkCreateQuestionDto {
  @ApiProperty({
    type: [CreateQuestionDto],
    description: 'Array of questions to create in bulk',
  })
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions: CreateQuestionDto[];
}
