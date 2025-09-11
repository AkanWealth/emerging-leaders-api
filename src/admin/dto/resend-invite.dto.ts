import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResendInviteDto {
  @ApiProperty({
    example: 'admin@example.com',
    description: 'Email of the admin to resend invite to',
  })
  @IsEmail()
  email: string;
}
