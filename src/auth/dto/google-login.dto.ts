import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GoogleLoginDto {
  @ApiProperty({ example: 'ya29.a0AfH6SM... (Google ID token)' })
  @IsNotEmpty()
  idToken: string;
}
