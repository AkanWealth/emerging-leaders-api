import { IsUUID, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({ example: 'a7890cd1-2345-6789-abcd-ef1234567890' })
  @IsUUID()
  userId: string;

  @ApiProperty({ example: 'refresh-token-string-here' })
  @IsString()
  refreshToken: string;
}
