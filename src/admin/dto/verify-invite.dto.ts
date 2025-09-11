import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyInviteDto {
  @ApiProperty({
    example: 'admin@example.com',
    description: 'Email address of the invited admin',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '123456',
    description: '6-digit invitation verification code',
    minLength: 6,
    maxLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  code: string;
}
