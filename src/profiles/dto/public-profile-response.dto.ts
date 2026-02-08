import { ApiProperty } from '@nestjs/swagger';

export class PublicProfileResponseDto {
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

  @ApiProperty({
    example: '2025-01-15T10:30:00.000Z',
    description: 'Дата регистрации',
  })
  created_at: Date;

  @ApiProperty({
    example: 42,
    description: 'Количество подписчиков',
  })
  followers_count: number;

  @ApiProperty({
    example: 15,
    description: 'Количество подписок',
  })
  following_count: number;

  @ApiProperty({
    example: true,
    description: 'Подписан ли текущий пользователь на этого',
    nullable: true,
  })
  is_following?: boolean | null;

  @ApiProperty({
    example: false,
    description: 'Подписан ли этот пользователь на текущего',
    nullable: true,
  })
  is_followed_by?: boolean | null;

  @ApiProperty({
    example: false,
    description: 'Заблокирован ли этот пользователь текущим',
    nullable: true,
  })
  is_blocked?: boolean | null;

  @ApiProperty({
    example: true,
    description: 'Онлайн ли пользователь (null если скрыл статус)',
    nullable: true,
  })
  is_online?: boolean | null;
}

export class ProfileStatsResponseDto {
  @ApiProperty({
    example: 150,
    description: 'Всего аниме в списках',
  })
  total_anime: number;

  @ApiProperty({
    example: 42,
    description: 'Просмотрено',
  })
  watched_count: number;

  @ApiProperty({
    example: 15,
    description: 'Смотрю',
  })
  watching_count: number;

  @ApiProperty({
    example: 23,
    description: 'В планах',
  })
  planned_count: number;

  @ApiProperty({
    example: 8,
    description: 'Заброшено',
  })
  dropped_count: number;

  @ApiProperty({
    example: 12,
    description: 'Любимые',
  })
  favorite_count: number;

  @ApiProperty({
    example: 5,
    description: 'Рекомендовано',
  })
  recommended_count: number;

  @ApiProperty({
    example: 2,
    description: 'Не нравится',
  })
  disliked_count: number;

  @ApiProperty({
    example: 7.8,
    description: 'Средняя оценка',
    nullable: true,
  })
  average_rating: number | null;

  @ApiProperty({
    example: 3,
    description: 'Количество рецензий',
  })
  reviews_count: number;

  @ApiProperty({
    example: 142,
    description: 'Количество комментариев',
  })
  comments_count: number;
}
