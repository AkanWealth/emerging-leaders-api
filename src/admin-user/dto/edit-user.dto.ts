import { IsOptional, IsString, IsEmail, IsInt } from 'class-validator';
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

  @ApiPropertyOptional({ example: 'No 40 Uk', description: 'Updated address of the user' })
    @IsOptional()
    @IsString()
  Address?: string;

  @ApiPropertyOptional({ example: 'Belgun', description: 'Updated city of the user' })
    @IsOptional()
    @IsString()
  city?: string;

    @ApiPropertyOptional({ example: 'Nigeria', description: 'Updated country of the user' })
    @IsOptional()
    @IsString()
  country?: string;

  @ApiPropertyOptional({ example: 'Smith', description: 'Updated last name of the user' })
    @IsOptional()
    @IsInt()
  postalcode?: number;
}
