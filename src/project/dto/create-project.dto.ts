import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, Matches } from 'class-validator';

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
    example: '#1D4ED8',
    description: 'Hex color code for project (e.g., #1D4ED8)',
  })
  @IsString()
  @Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: 'projectColor must be a valid hex color code',
  })
  projectColor: string;

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
