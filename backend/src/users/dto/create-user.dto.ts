import { IsEmail, IsMobilePhone, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @IsMobilePhone('pt-BR', {}, { message: 'Phone number must be a valid Brazilian number' })
  @IsNotEmpty({ message: 'Phone number is required' })
  phone: string;
}

/**
 * Internal DTO used by AuthService when calling UsersService.create().
 * Uses a plain interface since it never goes through class-validator's ValidationPipe.
 */
export interface CreateUserInternalDto {
  name: string;
  email: string;
  passwordHash: string;
  phone: string;
}