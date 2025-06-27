import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsDateString } from 'class-validator';

export class CreateSavingsDto {
  @ApiProperty({ example: '🏠', description: 'Emoji icon representing the savings goal' })
  @IsString()
  icon: string;

  @ApiProperty({ example: 'House Deposit' })
  @IsString()
  title: string;

  @ApiProperty({ example: 500000 })
  @IsNumber()
  targetAmount: number;

  @ApiProperty({ example: '2025-12-31', description: 'Date to complete the goal' })
  @IsDateString()
  targetDate: string;

  @ApiProperty({ example: '12345', description: 'Optional budget ID to link the goal' })
  @IsString() 
  budgetId?: string;
}
