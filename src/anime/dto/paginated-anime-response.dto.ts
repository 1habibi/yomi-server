import { ApiProperty } from '@nestjs/swagger';
import { AnimeResponseDto } from './anime-response.dto';

export class PaginationDto {
  @ApiProperty({ example: 1, description: 'Текущая страница' })
  page: number;

  @ApiProperty({ example: 20, description: 'Количество элементов на странице' })
  limit: number;

  @ApiProperty({ example: 150, description: 'Общее количество элементов' })
  total: number;

  @ApiProperty({ example: 8, description: 'Общее количество страниц' })
  total_pages: number;

  @ApiProperty({ example: true, description: 'Есть ли следующая страница' })
  has_next: boolean;

  @ApiProperty({ example: false, description: 'Есть ли предыдущая страница' })
  has_prev: boolean;
}

export class PaginatedAnimeResponseDto {
  @ApiProperty({ type: [AnimeResponseDto], description: 'Массив аниме' })
  data: AnimeResponseDto[];

  @ApiProperty({ type: PaginationDto, description: 'Информация о пагинации' })
  pagination: PaginationDto;
}
