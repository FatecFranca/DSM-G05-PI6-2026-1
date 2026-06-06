import { IsEmail, IsMobilePhone, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @IsOptional()
  password?: string;

  @IsMobilePhone('pt-BR', {}, { message: 'Phone number must be a valid Brazilian number' })
  @IsOptional()
  phone?: string;
}
