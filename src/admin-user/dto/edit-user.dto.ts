import { IsOptional, IsString, IsEmail, IsPhoneNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class EditUserDto {
  @ApiPropertyOptional({ example: 'Jane', description: 'Updated first name of the user' })
    @IsOptional()
    @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Smith', description: 'Updated last name of the user' })
    @IsOptional()
    @IsString()
  lastName?: string;

  @ApiPropertyOptional({ example: 'jane.smith@example.com', description: 'Updated email address' })
    @IsOptional()
    @IsEmail()
  email?: string;
}
