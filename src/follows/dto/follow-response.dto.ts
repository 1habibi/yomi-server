import { ApiProperty } from '@nestjs/swagger';

export class FollowUserDto {
  @ApiProperty({
    example: 'cmiuam7t00000u688exiu8oqz',
    description: 'ID пользователя',
  })
  id: string;

  @ApiProperty({
    example: 'username',
    description: 'Имя пользователя',
  })
  name: string;

  @ApiProperty({
    example: 'https://s3.ru-1.storage.selcloud.ru/yomi-avatars/avatars/avatar-123.webp',
    description: 'URL аватара',
    nullable: true,
  })
  avatar_url: string | null;
}

export class FollowResponseDto {
  @ApiProperty({
    example: 1,
    description: 'ID записи о подписке',
  })
  id: number;

  @ApiProperty({
    type: FollowUserDto,
    description: 'Данные пользователя',
  })
  user: FollowUserDto;

  @ApiProperty({
    example: '2025-02-03T12:00:00.000Z',
    description: 'Дата подписки',
  })
  created_at: Date;
}

export class PaginatedFollowsResponseDto {
  @ApiProperty({
    type: [FollowResponseDto],
    description: 'Список подписок',
  })
  follows: FollowResponseDto[];

  @ApiProperty({
    example: 42,
    description: 'Общее количество',
  })
  total: number;

  @ApiProperty({
    example: 1,
    description: 'Текущая страница',
  })
  page: number;

  @ApiProperty({
    example: 20,
    description: 'Лимит на странице',
  })
  limit: number;

  @ApiProperty({
    example: 3,
    description: 'Всего страниц',
  })
  total_pages: number;
}

export class FollowCheckResponseDto {
  @ApiProperty({
    example: true,
    description: 'Подписан ли текущий пользователь на указанного',
  })
  is_following: boolean;

  @ApiProperty({
    example: false,
    description: 'Подписан ли указанный пользователь на текущего',
  })
  is_followed_by: boolean;
}
