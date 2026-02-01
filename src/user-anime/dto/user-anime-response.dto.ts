import { ApiProperty } from '@nestjs/swagger';
import { InteractionType } from '@prisma/client';

export class AnimeBasicInfo {
  @ApiProperty({ example: 123 })
  id: number;

  @ApiProperty({ example: 'Магическая битва', type: String, nullable: true })
  title: string | null;

  @ApiProperty({ example: 'Jujutsu Kaisen', type: String, required: false, nullable: true })
  title_orig?: string | null;

  @ApiProperty({ example: 'https://example.com/poster.jpg', type: String, required: false, nullable: true })
  poster_url?: string | null;

  @ApiProperty({ example: 'https://example.com/anime_poster.jpg', type: String, required: false, nullable: true })
  anime_poster_url?: string | null;

  @ApiProperty({ example: 2020, type: Number, required: false, nullable: true })
  year?: number | null;

  @ApiProperty({ example: 24, type: Number, required: false, nullable: true })
  episodes_total?: number | null;

  @ApiProperty({ example: 8.5, type: Number, required: false, nullable: true })
  shikimori_rating?: number | null;
}

export class UserAnimeResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ type: AnimeBasicInfo })
  anime: AnimeBasicInfo;

  @ApiProperty({
    description: 'Списки, в которых находится аниме',
    enum: InteractionType,
    isArray: true,
    example: [InteractionType.WATCHING, InteractionType.FAVORITE],
  })
  list_types: InteractionType[];

  @ApiProperty({
    description: 'Оценка пользователя (1-10)',
    example: 8,
    type: Number,
    required: false,
    nullable: true,
  })
  rating?: number | null;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  added_at: Date;

  @ApiProperty({ example: '2024-01-20T15:45:00Z' })
  updated_at: Date;
}
