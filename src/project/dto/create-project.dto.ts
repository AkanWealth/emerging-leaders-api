import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({
    example: 'Website Redesign',
    description: 'The name or title of the project',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Redesign the company website to improve user experience and mobile responsiveness.',
    description: 'A brief description of the project',
  })
  @IsString()
  description: string;

  @ApiProperty({
    example: '2025-07-01T00:00:00Z',
    description: 'The project start date in ISO 8601 format',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    example: '2025-12-31T23:59:59Z',
    description: 'The expected end date for the project in ISO 8601 format',
  })
  @IsDateString()
  endDate: string;

  @ApiProperty({
    example: 'cat-12345',
    description: 'The ID of the project category this project belongs to',
  })
  @IsString()
  categoryId: string;
}
