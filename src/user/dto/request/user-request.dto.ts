import { IsString, IsEmail, MinLength, Matches } from 'class-validator';

export class RegisterRequestDto {
  @IsString()
  name: string;

  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[A-Z])(?=.*\d).{8,}$/, {
    message:
      'Password must contain at least one uppercase letter and one number',
  })
  password: string;
}

export class LoginRequestDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;
  @IsString()
  password: string;
}
