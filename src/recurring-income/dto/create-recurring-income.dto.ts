import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsEnum, IsDateString, IsNumber } from 'class-validator';
import { Frequency, IncomeType } from '@prisma/client';

export class CreateRecurringIncomeDto {
  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiProperty()
  @IsUUID()
  walletId: string;

  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty({ enum: Frequency })
  @IsEnum(Frequency)
  frequency: Frequency;

  @ApiProperty({ enum: IncomeType })
  @IsEnum(IncomeType)
  type: IncomeType;

  @ApiProperty()
  @IsUUID()
  currencyId: string;

  @ApiProperty({ required: false })
  @IsString()
  description?: string;

  @ApiProperty()
  @IsDateString()
  startDate: string;
}
