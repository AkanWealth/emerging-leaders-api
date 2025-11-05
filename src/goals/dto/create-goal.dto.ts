import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsDateString } from 'class-validator';

export class CreateGoalDto {
  @ApiProperty({ example: 'Complete final report' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'daily', required: false })
  @IsOptional()
  @IsString()
  repeat?: string;

  @ApiProperty({ example: '2025-06-16T08:00:00Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2025-06-16T17:00:00Z' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ example: '08:00', required: false })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiProperty({ example: '17:00', required: false })
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isRepeatEnabled?: boolean;

  @ApiProperty({ example: 'https://cdn.app/icons/goal-check.png', required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ example: 'project-uuid' })
  @IsString()
  projectId: string;
}
