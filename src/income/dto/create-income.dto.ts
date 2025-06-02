import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateIncomeDto {
  @ApiProperty({
    example: 5000,
    description: 'The amount of income received (in numbers)',
  })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({
    example: 'Salary for June 2025',
    description: 'Optional description or note about the income source',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: '8f14e45f-ea3b-4c10-9d7b-9c2a5d9e5c5e',
    description: 'Optional UUID of the income category this belongs to',
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;
}
