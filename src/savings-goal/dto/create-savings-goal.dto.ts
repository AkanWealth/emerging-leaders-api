// create-savings-goal.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSavingsGoalDto {
  @ApiProperty()
  @IsString()
  currency: string;

  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty()
  @IsBoolean()
  hasSpecificGoal: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  goalTitle?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  targetAmount?: number;

  @ApiProperty({ required: false, type: String, format: 'date-time' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  targetDate?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  goalIcon?: string;
}
