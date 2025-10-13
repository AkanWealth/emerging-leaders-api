import { IsEnum, IsNotEmpty, IsString, IsUUID, IsDateString, IsOptional, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AssessmentStatus } from '@prisma/client';

export class CreateAssessmentDto {
  @ApiProperty({
    description: 'The title of the assessment',
    example: 'Financial Literacy Test',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'UUID of the assessment category',
    example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
  })
  @IsUUID()
  categoryId: string;

  @ApiProperty({
    description: 'Status of the assessment',
    enum: AssessmentStatus,
    example: AssessmentStatus.OPEN,
  })
  @IsEnum(AssessmentStatus)
  status: AssessmentStatus;

  @ApiProperty({
    description: 'Scheduled date and time for the assessment in ISO 8601 format',
    example: '2025-10-13T09:30:00Z',
  })
  @IsNotEmpty()
  @IsDateString()
  scheduledFor: string;

  @ApiProperty({
    description: 'Month when the assessment is scheduled',
    example: 'October',
    required: false,
  })
  @IsOptional()
  @IsString()
  scheduledMonth?: string;

  @ApiProperty({
    description: 'Year when the assessment is scheduled',
    example: 2025,
    required: false,
  })
  @IsOptional()
  @IsInt()
  scheduledYear?: number;
}
