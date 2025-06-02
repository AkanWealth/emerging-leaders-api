import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateGoalDto {
  @ApiProperty({
    example: 'Finish writing project report',
    description: 'The title or name of the goal',
  })
  @IsString()
  title: string;

  @ApiProperty({
    required: false,
    example: 'weekly',
    description: 'Optional repeat pattern (e.g., daily, weekly, monthly)',
  })
  @IsOptional()
  @IsString()
  repeat?: string;

  @ApiProperty({
    example: '2025-06-10',
    description: 'Target date for the goal (in ISO date format, e.g., YYYY-MM-DD)',
  })
  @IsDateString()
  date: string;

  @ApiProperty({
    required: false,
    example: '14:30',
    description: 'Optional time for the goal (HH:mm format)',
  })
  @IsOptional()
  @IsString()
  time?: string;

  @ApiProperty({
    example: 'b7e23ec2-35b6-4e7b-9b0d-2936f2c78c4f',
    description: 'The ID of the associated project (UUID format)',
  })
  @IsString()
  projectId: string;
}
