import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email пользователя для восстановления пароля',
    required: true
  })
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Токен для сброса пароля',
    required: true
  })
  @IsString()
  token: string;

  @ApiProperty({
    example: 'newStrongPassword123',
    description: 'Новый пароль пользователя',
    required: true,
    minLength: 6,
    maxLength: 50
  })
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  newPassword: string;
}
