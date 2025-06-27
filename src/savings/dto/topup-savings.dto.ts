import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNumber } from 'class-validator';

export class TopupSavingsDto {
  @ApiProperty({ description: 'Savings Goal ID' })
  @IsUUID()
  goalId: string;

  @ApiProperty({ description: 'Amount to top up' })
  @IsNumber()
  amount: number;
}
