import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsDateString, IsOptional, IsUUID } from 'class-validator';

export class CreateSavingsGoalDto {
  @ApiProperty({ example: '🏠', description: 'Emoji icon representing the savings goal' })
  @IsString()
  icon: string;

  @ApiProperty({ example: 'House Deposit', description: 'Title of the savings goal' })
  @IsString()
  title: string;

  @ApiProperty({ example: 500000, description: 'Target amount to save for the goal' })
  @IsNumber()
  targetAmount: number;

  @ApiProperty({ example: '2025-12-31', description: 'Date to complete the goal' })
  @IsDateString()
  targetDate: string;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'Optional related budget ID' })
  @IsOptional()
  @IsUUID()
  budgetId?: string;
}
