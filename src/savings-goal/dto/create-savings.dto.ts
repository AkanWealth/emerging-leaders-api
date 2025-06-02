import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsDateString, Min } from 'class-validator';

export class CreateSavingsGoalDto {
  @ApiProperty({
    example: 'Vacation Trip to Bali',
    description: 'The title or name of the savings goal',
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: 5000,
    description: 'The target amount to save for this goal',
  })
  @IsNumber()
  @Min(0)
  targetAmount: number;

  @ApiPropertyOptional({
    example: 'Saving up for a vacation trip next summer',
    description: 'Optional description or notes about the savings goal',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: '2025-12-31T23:59:59Z',
    description: 'Optional due date to achieve the goal, in ISO 8601 format',
  })
  @IsDateString()
  @IsOptional()
  dueDate?: string; // ISO string date
}

export class UpdateSavingsGoalDto {
  @ApiPropertyOptional({
    example: 'Updated Vacation Trip to Bali',
    description: 'Updated title of the savings goal',
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    example: 6000,
    description: 'Updated target amount for the savings goal',
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  targetAmount?: number;

  @ApiPropertyOptional({
    example: 'Extended deadline for the vacation savings',
    description: 'Updated description or notes about the savings goal',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: '2026-01-31T23:59:59Z',
    description: 'Updated due date to achieve the goal, in ISO 8601 format',
  })
  @IsDateString()
  @IsOptional()
  dueDate?: string;
}
