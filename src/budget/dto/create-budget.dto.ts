import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateBudgetDto {
  @ApiProperty()
  @IsNumber()
  limit: number;

  @ApiProperty()
  @IsString()
  categoryId: string;

  @ApiProperty({ enum: ['one-off', 'daily', 'weekly', 'monthly'] })
  @IsString()
  repeat: string;
}
