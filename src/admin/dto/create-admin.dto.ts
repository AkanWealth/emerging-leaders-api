// admin/dto/create-admin.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength} from 'class-validator';

export class CreateAdminDto {
  @ApiProperty({ example: 'Admin firstName' })
  @IsString()
  firstname: string;

    @ApiProperty({ example: 'Admin lastName' })
  @IsString()
  lastname: string;

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



