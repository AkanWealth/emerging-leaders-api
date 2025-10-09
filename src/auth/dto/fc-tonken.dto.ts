import { ApiProperty } from '@nestjs/swagger';

export class RegisterFcmTokenDto {
  @ApiProperty({ example: 'abcd1234', description: 'Firebase Cloud Messaging token' })
  token: string;

  @ApiProperty({ example: 'android', description: 'Platform type (android, ios, web)' })
  platform: string;
}
