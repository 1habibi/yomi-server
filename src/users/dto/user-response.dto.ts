import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ 
    example: 'cmiuam7t00000u688exiu8oqz',
    description: 'Уникальный идентификатор пользователя'
  })
  id: string;

  @ApiProperty({ 
    example: 'email@mail.ru',
    description: 'Email пользователя'
  })
  email: string;

  @ApiProperty({ 
    example: 'name',
    description: 'Имя пользователя'
  })
  name: string;

  @ApiProperty({ 
    example: 'USER',
    enum: ['USER', 'ADMIN'],
    description: 'Роль пользователя'
  })
  role: string;

  @ApiProperty({ 
    example: true,
    description: 'Подтвержден ли email пользователя'
  })
  isEmailConfirmed: boolean;

  @ApiProperty({ 
    example: "2025-12-26T12:46:43.797Z",
    description: 'Дата регистрации пользователя'
  })
  createdAt: Date;

  @ApiProperty({ 
    example: "2025-12-26T12:46:43.797Z",
    description: 'Дата последнего обновления профиля'
  })
  updatedAt: Date;
}