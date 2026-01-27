import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { CommentResponseDto } from './comment-response.dto';

export class PaginationDto {
  @ApiProperty({
    description: 'Текущая страница',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Количество элементов на странице',
    example: 20,
  })
  limit: number;

  @ApiProperty({
    description: 'Общее количество элементов',
    example: 150,
  })
  total: number;

  @ApiProperty({
    description: 'Общее количество страниц',
    example: 8,
  })
  total_pages: number;

  @ApiProperty({
    description: 'Есть ли предыдущая страница',
    example: false,
  })
  has_prev: boolean;

  @ApiProperty({
    description: 'Есть ли следующая страница',
    example: true,
  })
  has_next: boolean;
}

export class PaginatedCommentsResponseDto {
  @ApiProperty({
    description: 'Список комментариев',
    type: () => CommentResponseDto,
    isArray: true,
  })
  data: CommentResponseDto[];

  @ApiProperty({
    description: 'Информация о пагинации',
    type: PaginationDto,
  })
  pagination: PaginationDto;
}
