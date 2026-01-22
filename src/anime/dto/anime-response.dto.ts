import { ApiProperty } from '@nestjs/swagger';

export class GenreDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Экшен' })
  name: string;
}

export class TranslationDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'AniLibria', type: String, nullable: true })
  title: string | null;

  @ApiProperty({ example: 'voice', type: String, nullable: true })
  trans_type: string | null;
}

export class ScreenshotDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'https://example.com/screenshot.jpg', type: String, nullable: true })
  url: string | null;
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

  @ApiProperty({ example: 'RU', type: String, nullable: true })
  country: string | null;
}

export class AnimeGenreItemDto {
  @ApiProperty({ type: GenreDto, nullable: true })
  genre: GenreDto | null;
}

export class AnimePersonItemDto {
  @ApiProperty({ type: PersonDto, nullable: true })
  person: PersonDto | null;

  @ApiProperty({ example: 'Director', type: String, nullable: true })
  role: string | null;
}

export class AnimeStudioItemDto {
  @ApiProperty({ type: StudioDto, nullable: true })
  studio: StudioDto | null;
}

export class AnimeResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'anime-12345' })
  kodik_id: string;

  @ApiProperty({ example: 'anime-serial', type: String, nullable: true })
  kodik_type: string | null;

  @ApiProperty({ example: 'https://kodik.info/anime/12345', type: String, nullable: true })
  link: string | null;

  @ApiProperty({ example: 'Наруто', type: String, nullable: true })
  title: string | null;

  @ApiProperty({ example: 'Naruto', type: String, nullable: true })
  title_orig: string | null;

  @ApiProperty({ example: 'ナルト', type: String, nullable: true })
  other_title: string | null;

  @ApiProperty({ example: 2002, type: Number, nullable: true })
  year: number | null;

  @ApiProperty({ example: 5, type: Number, nullable: true })
  last_season: number | null;

  @ApiProperty({ example: 220, type: Number, nullable: true })
  last_episode: number | null;

  @ApiProperty({ example: 220, type: Number, nullable: true })
  episodes_count: number | null;

  @ApiProperty({ example: '301', type: String, nullable: true })
  kinopoisk_id: string | null;

  @ApiProperty({ example: 'tt0409591', type: String, nullable: true })
  imdb_id: string | null;

  @ApiProperty({ example: '20', type: String, nullable: true })
  shikimori_id: string | null;

  @ApiProperty({ example: '720p', type: String, nullable: true })
  quality: string | null;

  @ApiProperty({ example: false, type: Boolean, nullable: true })
  camrip: boolean | null;

  @ApiProperty({ example: false, type: Boolean, nullable: true })
  lgbt: boolean | null;

  @ApiProperty({ type: Date, nullable: true })
  created_at: Date | null;

  @ApiProperty({ type: Date, nullable: true })
  updated_at: Date | null;

  @ApiProperty({ example: 'Описание аниме', type: String, nullable: true })
  description: string | null;

  @ApiProperty({ example: 'Расширенное описание', type: String, nullable: true })
  anime_description: string | null;

  @ApiProperty({ example: 'https://example.com/poster.jpg', type: String, nullable: true })
  poster_url: string | null;

  @ApiProperty({ example: 'https://shikimori.org/poster.jpg', type: String, nullable: true })
  anime_poster_url: string | null;

  @ApiProperty({ type: Date, nullable: true })
  premiere_world: Date | null;

  @ApiProperty({ type: Date, nullable: true })
  aried_at: Date | null;

  @ApiProperty({ type: Date, nullable: true })
  released_at: Date | null;

  @ApiProperty({ example: 'PG-13', type: String, nullable: true })
  rating_mpaa: string | null;

  @ApiProperty({ example: 13, type: Number, nullable: true })
  minimal_age: number | null;

  @ApiProperty({ example: 220, type: Number, nullable: true })
  episodes_total: number | null;

  @ApiProperty({ example: 220, type: Number, nullable: true })
  episodes_aired: number | null;

  @ApiProperty({ example: 8.3, type: Number, nullable: true })
  imdb_rating: number | null;

  @ApiProperty({ example: 150000, type: Number, nullable: true })
  imdb_votes: number | null;

  @ApiProperty({ example: 8.5, type: Number, nullable: true })
  shikimori_rating: number | null;

  @ApiProperty({ example: 50000, type: Number, nullable: true })
  shikimori_votes: number | null;

  @ApiProperty({ type: Date, nullable: true })
  next_episode_at: Date | null;

  @ApiProperty({ example: 'released', type: String, nullable: true })
  all_status: string | null;

  @ApiProperty({ example: 'tv', type: String, nullable: true })
  anime_kind: string | null;

  @ApiProperty({ example: 24, type: Number, nullable: true })
  duration: number | null;

  @ApiProperty({ type: [AnimeGenreItemDto] })
  anime_genres: AnimeGenreItemDto[];

  @ApiProperty({ type: [TranslationDto] })
  anime_translations: TranslationDto[];

  @ApiProperty({ type: [ScreenshotDto] })
  anime_screenshots: ScreenshotDto[];

  @ApiProperty({ type: [AnimePersonItemDto] })
  anime_persons: AnimePersonItemDto[];

  @ApiProperty({ type: [AnimeStudioItemDto] })
  anime_studios: AnimeStudioItemDto[];

  @ApiProperty({ type: [BlockedCountryDto] })
  blocked_countries: BlockedCountryDto[];
}