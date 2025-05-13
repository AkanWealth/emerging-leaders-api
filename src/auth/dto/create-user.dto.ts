import { IsEmail, IsString, MinLength, Matches } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/, {
    message: 'Password must include uppercase, number, and special character',
  })
  password: string;
}
