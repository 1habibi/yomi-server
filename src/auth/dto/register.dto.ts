import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
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
    minLength: 6,
    maxLength: 50
  })
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  password: string;

  @ApiProperty({
    example: 'superuser123',
    description: 'Имя пользователя',
    required: true,
    minLength: 4,
    maxLength: 50
  })
  @IsString()
  @MinLength(4)
  @MaxLength(50)
  name: string;
}
