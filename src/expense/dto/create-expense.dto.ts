import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateExpenseDto {
  @ApiProperty({
    example: 150.75,
    description: 'The amount of the expense (numeric value)',
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    example: 'Office supplies purchase',
    description: 'A brief description of the expense',
  })
  @IsString()
  description: string;

  @ApiProperty({
    example: 'd2f1a567-9b88-42af-9e90-4b3c9f3d8a7a',
    description: 'The ID of the category this expense belongs to (UUID format)',
  })
  @IsString()
  categoryId: string;

  @ApiProperty({
    required: false,
    example: 'b1c2d3e4-f5g6-7h8i-9j0k-l1m2n3o4p5q6',
    description: 'The ID of the budget this expense is associated with (UUID format)',
  })
  @IsString()
  budgetId?: string;
}
