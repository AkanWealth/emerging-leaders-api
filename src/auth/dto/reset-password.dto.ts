import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Email address of the user resetting the password',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Must be a valid email address' })
  email: string;

  @ApiProperty({
    description: 'New password (minimum 6 characters)',
    example: 'NewPass123',
  })
  @IsString()
  @MinLength(6, { message: 'New password must be at least 6 characters' })
  newPassword: string;

  @ApiProperty({
    description: 'Confirm new password (minimum 6 characters)',
    example: 'NewPass123',
  })
  @IsString()
  @MinLength(6, { message: 'Confirm password must be at least 6 characters' })
  confirmPassword: string;
}
