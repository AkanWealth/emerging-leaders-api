import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RegisterFcmTokenDto {
  @ApiProperty({ example: 'abcd1234', description: 'Firebase Cloud Messaging token' })
  @IsString()
  token: string;

  @ApiProperty({ example: 'android', description: 'Platform type (android, ios, web)' })
  @IsString()
  platform: string;
}
