import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InviteAdminsDto {
  @ApiProperty({
    example: 'John',
    description: 'First name of the admin being invited',
    required: false,
  })
  @IsOptional()
  @IsString()
  firstname?: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Last name of the admin being invited',
    required: false,
  })
  @IsOptional()
  @IsString()
  lastname?: string;

  @ApiProperty({
    example: 'admin@example.com',
    description: 'Email address of the admin being invited',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
