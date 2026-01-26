import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class ChangeEmailDto {
  @ApiProperty({
    example: 'newemail@example.com',
    description: 'Новый email адрес',
    required: true,
  })
  @IsEmail({}, { message: 'Введите корректный email адрес' })
  newEmail: string;

  @ApiProperty({
    example: 'currentPassword123',
    description: 'Текущий пароль для подтверждения',
    required: true,
  })
  @IsString()
  password: string;
}
