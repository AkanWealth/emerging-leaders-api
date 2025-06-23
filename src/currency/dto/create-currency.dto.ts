import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateCurrencyDto {
  @ApiProperty({ example: 'NGN' })
  @IsString()
  code: string;

  @ApiProperty({ example: '₦' })
  @IsString()
  symbol: string;
}
