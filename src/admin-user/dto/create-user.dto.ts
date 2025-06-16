// admin/dto/create-user.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail } from 'class-validator';

export class CreateUserByAdminDto {
  @ApiProperty({ example: 'John', description: 'First name of the user' })
    @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name of the user' })
    @IsString()
  lastName: string;

  @ApiProperty({ example: 'john.doe@example.com', description: 'Email address of the user' })
    @IsEmail()
  email: string;
}
