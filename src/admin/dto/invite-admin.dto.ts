import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InviteAdminsDto {
  @ApiProperty({
    example: 'John',
    description: 'First name of the admin being invited',
  })
  @IsString()
  @IsNotEmpty()
  firstname: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Last name of the admin being invited',
  })
  @IsString()
  @IsNotEmpty()
  lastname: string;

  @ApiProperty({
    example: 'admin@example.com',
    description: 'Email address of the admin being invited',
  })
  @IsEmail()
  email: string;
}
