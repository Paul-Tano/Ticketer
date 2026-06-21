import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @MinLength(3, { message: 'To short name' })
  @IsString({ message: 'Invalid name' })
  username!: string;

  @IsNotEmpty({ message: 'email field is required' })
  @IsEmail({}, { message: 'invalid email' })
  email!: string;

  @IsString()
  @MinLength(4)
  password!: string;

  @IsNotEmpty({ message: 'Confirmation password field is required' })
  confirm!: string;

  @IsOptional()
  role?: string;
}
