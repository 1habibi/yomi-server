import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    example: 'currentPassword123',
    description: 'Текущий пароль',
    required: true,
  })
  @IsString()
  currentPassword: string;

  @ApiProperty({
    example: 'newPassword456',
    description: 'Новый пароль',
    required: true,
    minLength: 6,
    maxLength: 50,
  })
  @IsString()
  @MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
  @MaxLength(50, { message: 'Пароль не должен превышать 50 символов' })
  newPassword: string;
}
