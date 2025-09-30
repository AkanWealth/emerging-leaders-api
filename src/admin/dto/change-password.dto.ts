// dto/change-password.dto.ts
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'The email of the user requesting password change',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'One-time password (OTP) sent to user email',
    example: '123456',
  })
  @IsNotEmpty()
  otp: string;

  @ApiProperty({
    description: 'New password (must be at least 8 characters)',
    example: 'NewStrongPass123!',
    minLength: 8,
  })
  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;

  @ApiProperty({
    description: 'Confirmation of the new password (must match newPassword)',
    example: 'NewStrongPass123!',
  })
  @IsNotEmpty()
  confirmPassword: string;
}
