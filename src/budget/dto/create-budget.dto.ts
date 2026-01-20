import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateBudgetDto {
  @ApiProperty({
    example: 500,
    description: 'The spending limit for this budget',
  })
  @IsNumber()
  limit: number;

  @ApiProperty({
    example: 'abc123-uuid-category',
    description: 'The unique ID of the category this budget belongs to',
  })
  @IsString()
  categoryId: string;

  @ApiProperty({
    example: 'i am a good person',
    description: 'The description of the category this budget belongs to',
  })
  @IsString()
  description: string;

  @ApiProperty({
    enum: ['one-off', 'daily', 'weekly', 'monthly'],
    example: 'monthly',
    description: 'The recurrence pattern of the budget',
  })
  @IsString()
  repeat: string;
}
