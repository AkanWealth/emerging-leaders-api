import { IsOptional, IsString, IsEmail, IsInt } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class EditAdminDto {
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
