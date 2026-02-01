import { ApiProperty } from '@nestjs/swagger';
import { UserAnimeResponseDto } from './user-anime-response.dto';

export class ListStatsDto {
  @ApiProperty({ example: 50, description: 'Общее количество аниме' })
  total: number;

  @ApiProperty({ example: 5, description: 'Смотрю' })
  watching: number;

  @ApiProperty({ example: 30, description: 'Просмотрено' })
  watched: number;

  @ApiProperty({ example: 10, description: 'В планах' })
  planned: number;

  @ApiProperty({ example: 5, description: 'Заброшено' })
  dropped: number;

  @ApiProperty({ example: 12, description: 'Любимое' })
  favorite: number;

  @ApiProperty({ example: 8, description: 'Рекомендую' })
  recommended: number;

  @ApiProperty({ example: 2, description: 'Ненавижу' })
  disliked: number;

  @ApiProperty({
    example: 7.8,
    description: 'Средняя оценка',
    required: false,
  })
  average_rating?: number;
}

export class UserListsResponseDto {
  @ApiProperty({
    type: [UserAnimeResponseDto],
    description: 'Аниме в списке "Смотрю"',
  })
  watching: UserAnimeResponseDto[];

  @ApiProperty({
    type: [UserAnimeResponseDto],
    description: 'Аниме в списке "Просмотрено"',
  })
  watched: UserAnimeResponseDto[];

  @ApiProperty({
    type: [UserAnimeResponseDto],
    description: 'Аниме в списке "В планах"',
  })
  planned: UserAnimeResponseDto[];

  @ApiProperty({
    type: [UserAnimeResponseDto],
    description: 'Аниме в списке "Заброшено"',
  })
  dropped: UserAnimeResponseDto[];

  @ApiProperty({
    type: [UserAnimeResponseDto],
    description: 'Любимое аниме',
  })
  favorite: UserAnimeResponseDto[];

  @ApiProperty({
    type: [UserAnimeResponseDto],
    description: 'Рекомендованное аниме',
  })
  recommended: UserAnimeResponseDto[];

  @ApiProperty({
    type: [UserAnimeResponseDto],
    description: 'Нелюбимое аниме',
  })
  disliked: UserAnimeResponseDto[];

  @ApiProperty({
    type: ListStatsDto,
    description: 'Статистика по спискам',
  })
  stats: ListStatsDto;
}
