import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email пользователя',
    required: true
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'yourStrongPassword123',
    description: 'Пароль пользователя',
    required: true,
    minLength: 6
  })
  @IsString()
  password: string;
}
