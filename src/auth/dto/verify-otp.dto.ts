import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({
    description: 'User email address to verify OTP',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Must be a valid email address' })
  email: string;

  @ApiProperty({
    description: 'One-time password (OTP) sent to user email',
    example: '123456',
  })
  @IsString()
  otp: string;
}
