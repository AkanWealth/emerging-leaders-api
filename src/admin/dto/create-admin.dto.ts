// admin/dto/create-admin.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength} from 'class-validator';

export class CreateAdminDto {
  @ApiProperty({ example: 'Admin Name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'admin@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'securePassword123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'securePassword123' })
  @IsString()
  @MinLength(6)
  confirmPassword: string;
}
