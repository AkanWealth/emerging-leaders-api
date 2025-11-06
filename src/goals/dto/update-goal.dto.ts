import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsDateString } from 'class-validator';

export class UpdateGoalDto {
  @ApiPropertyOptional({ example: 'Complete final report' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'daily' })
  @IsOptional()
  @IsString()
  repeat?: string;

  @ApiPropertyOptional({ example: '2025-06-16T08:00:00Z' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2025-06-16T17:00:00Z' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: '08:00' })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiPropertyOptional({ example: '17:00' })
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isRepeatEnabled?: boolean;

  @ApiPropertyOptional({ example: 'https://cdn.app/icons/goal-check.png' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ example: 'project-uuid' })
  @IsOptional()
  @IsString()
  projectId?: string;
}
