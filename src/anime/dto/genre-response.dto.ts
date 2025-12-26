import { ApiProperty } from '@nestjs/swagger';

export class GenreResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Экшен' })
  name: string;

  @ApiProperty({ 
    example: { anime_genres: 150 },
    description: 'Количество аниме в жанре'
  })
  _count: { anime_genres: number };
}
