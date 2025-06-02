import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSavingsGoalDto {
  @ApiProperty({
    example: 'USD',
    description: 'The currency for the savings goal (e.g., USD, EUR, NGN)',
  })
  @IsString()
  currency: string;

  @ApiProperty({
    example: 200,
    description: 'The initial amount being saved towards the goal',
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    example: true,
    description: 'Indicates if the user has a specific savings goal in mind',
  })
  @IsBoolean()
  hasSpecificGoal: boolean;

  @ApiProperty({
    required: false,
    example: 'New Laptop',
    description: 'Optional title for the savings goal',
  })
  @IsOptional()
  @IsString()
  goalTitle?: string;

  @ApiProperty({
    required: false,
    example: 1500,
    description: 'Optional target amount the user aims to save',
  })
  @IsOptional()
  @IsNumber()
  targetAmount?: number;

  @ApiProperty({
    required: false,
    type: String,
    format: 'date-time',
    example: '2025-09-30T00:00:00Z',
    description: 'Optional target date by which the goal should be reached (ISO 8601 format)',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  targetDate?: Date;

  @ApiProperty({
    required: false,
    example: 'laptop-icon.png',
    description: 'Optional icon or image identifier for the goal',
  })
  @IsOptional()
  @IsString()
  goalIcon?: string;
}
