import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenreDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Экшен' })
  name: string;
}

export class TranslationDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'AniLibria' })
  title: string;

  @ApiProperty({ example: 'voice' })
  trans_type: string;
}

export class ScreenshotDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'https://example.com/screenshot.jpg' })
  url: string;
}

export class PersonDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Хаяо Миядзаки' })
  name: string;
}

export class StudioDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Studio Ghibli' })
  name: string;
}

export class BlockedCountryDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'RU' })
  country: string;
}

export class AnimeResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'anime-12345' })
  kodik_id: string;

  @ApiPropertyOptional({ example: 'anime-serial' })
  kodik_type?: string;

  @ApiPropertyOptional({ example: 'https://kodik.info/anime/12345' })
  link?: string;

  @ApiPropertyOptional({ example: 'Наруто' })
  title?: string;

  @ApiPropertyOptional({ example: 'Naruto' })
  title_orig?: string;

  @ApiPropertyOptional({ example: 'ナルト' })
  other_title?: string;

  @ApiPropertyOptional({ example: 2002 })
  year?: number;

  @ApiPropertyOptional({ example: 5 })
  last_season?: number;

  @ApiPropertyOptional({ example: 220 })
  last_episode?: number;

  @ApiPropertyOptional({ example: 220 })
  episodes_count?: number;

  @ApiPropertyOptional({ example: '301' })
  kinopoisk_id?: string;

  @ApiPropertyOptional({ example: 'tt0409591' })
  imdb_id?: string;

  @ApiPropertyOptional({ example: '20' })
  shikimori_id?: string;

  @ApiPropertyOptional({ example: '720p' })
  quality?: string;

  @ApiPropertyOptional({ example: false })
  camrip?: boolean;

  @ApiPropertyOptional({ example: false })
  lgbt?: boolean;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  @ApiPropertyOptional({ example: 'Описание аниме' })
  description?: string;

  @ApiPropertyOptional({ example: 'Расширенное описание' })
  anime_description?: string;

  @ApiPropertyOptional({ example: 'https://example.com/poster.jpg' })
  poster_url?: string;

  @ApiPropertyOptional({ example: 'https://shikimori.org/poster.jpg' })
  anime_poster_url?: string;

  @ApiPropertyOptional()
  premiere_world?: Date;

  @ApiPropertyOptional()
  aired_at?: Date;

  @ApiPropertyOptional()
  released_at?: Date;

  @ApiPropertyOptional({ example: 'PG-13' })
  rating_mpaa?: string;

  @ApiPropertyOptional({ example: 13 })
  minimal_age?: number;

  @ApiPropertyOptional({ example: 220 })
  episodes_total?: number;

  @ApiPropertyOptional({ example: 220 })
  episodes_aired?: number;

  @ApiPropertyOptional({ example: 8.3 })
  imdb_rating?: number;

  @ApiPropertyOptional({ example: 150000 })
  imdb_votes?: number;

  @ApiPropertyOptional({ example: 8.5 })
  shikimori_rating?: number;

  @ApiPropertyOptional({ example: 50000 })
  shikimori_votes?: number;

  @ApiPropertyOptional()
  next_episode_at?: Date;

  @ApiPropertyOptional({ example: 'released' })
  all_status?: string;

  @ApiPropertyOptional({ example: 'tv' })
  anime_kind?: string;

  @ApiPropertyOptional({ example: 24 })
  duration?: number;

  @ApiProperty({ type: [Object] })
  anime_genres: { genre: GenreDto }[];

  @ApiProperty({ type: [TranslationDto] })
  anime_translations: TranslationDto[];

  @ApiProperty({ type: [ScreenshotDto] })
  anime_screenshots: ScreenshotDto[];

  @ApiProperty({ type: [Object] })
  anime_persons: { person: PersonDto; role: string }[];

  @ApiProperty({ type: [Object] })
  anime_studios: { studio: StudioDto }[];

  @ApiProperty({ type: [BlockedCountryDto] })
  blocked_countries: BlockedCountryDto[];
}
