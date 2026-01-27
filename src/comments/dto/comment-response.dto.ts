import { ApiProperty, ApiPropertyOptional, getSchemaPath } from '@nestjs/swagger';

export class CommentUserDto {
  @ApiProperty({
    description: 'ID пользователя',
    example: 'clxyz123abc',
  })
  id: string;

  @ApiProperty({
    description: 'Имя пользователя',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'URL аватара пользователя',
    example: 'https://example.com/avatar.jpg',
    nullable: true,
    type: () => String,
  })
  avatar_url: string | null;
}

export class CommentResponseDto {
  @ApiProperty({
    description: 'ID комментария',
    example: 42,
  })
  id: number;

  @ApiProperty({
    description: 'Текст комментария',
    example: 'Отличное аниме!',
  })
  content: string;

  @ApiProperty({
    description: 'ID аниме',
    example: 123,
  })
  anime_id: number;

  @ApiProperty({
    description: 'ID родительского комментария',
    example: 10,
    nullable: true,
    type: () => Number,
  })
  parent_id: number | null;

  @ApiProperty({
    description: 'Информация об авторе комментария',
    type: CommentUserDto,
  })
  user: CommentUserDto;

  @ApiProperty({
    description: 'Количество лайков',
    example: 15,
  })
  likes_count: number;

  @ApiProperty({
    description: 'Количество дизлайков',
    example: 2,
  })
  dislikes_count: number;

  @ApiProperty({
    description: 'Реакция текущего пользователя: true = лайк, false = дизлайк, null = нет реакции',
    example: true,
    nullable: true,
    type: () => Boolean,
  })
  is_liked_by_current_user: boolean | null;

  @ApiProperty({
    description: 'Количество ответов на комментарий',
    example: 5,
  })
  replies_count: number;

  @ApiPropertyOptional({
    description: 'Вложенные ответы на комментарий',
    type: () => CommentResponseDto,
    isArray: true,
  })
  replies?: CommentResponseDto[];

  @ApiProperty({
    description: 'Дата создания комментария',
    example: '2024-01-26T12:00:00.000Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Дата последнего обновления комментария',
    example: '2024-01-26T13:00:00.000Z',
  })
  updated_at: Date;
}
