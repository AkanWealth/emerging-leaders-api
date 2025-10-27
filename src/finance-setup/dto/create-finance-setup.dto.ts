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

}
