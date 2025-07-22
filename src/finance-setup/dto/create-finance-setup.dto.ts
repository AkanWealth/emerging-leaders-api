import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateFinanceSetupDto {
  @ApiProperty({ example: 'clsmewkz30008kthzqxduvtey', description: 'Currency ID' })
  @IsNotEmpty()
  @IsString()
  currencyId: string;

  @ApiProperty({ example: 150000 })
  @IsNumber()
  salaryAmount: number;

  @ApiProperty({ example: '🏠', required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ example: 'House Deposit' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 500000 })
  @IsNumber()
  targetAmount: number;

  @ApiProperty({ example: '2025-12-31T00:00:00.000Z' })
  @IsDateString()
  targetDate: Date;
}
