import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiPropertyOptional({ description: 'Icon for the category' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ description: 'Title of the category' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Description of the category' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ description: 'Usage context: finance, project, or both' })
  @IsOptional()
  @IsString()
  usageContext?: string;
}
