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

  @ApiProperty({ example: 'AniLibria' })
  title: string | null;

  @ApiProperty({ example: 'voice' })
  trans_type: string | null;
}

export class ScreenshotDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'https://example.com/screenshot.jpg' })
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

  @ApiProperty({ example: 'RU' })
  country: string | null;
}

export class AnimeResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'anime-12345' })
  kodik_id: string;

  @ApiProperty({ example: 'anime-serial' })
  kodik_type: string | null;

  @ApiProperty({ example: 'https://kodik.info/anime/12345' })
  link: string | null;

  @ApiProperty({ example: 'Наруто' })
  title: string | null;

  @ApiProperty({ example: 'Naruto' })
  title_orig: string | null;

  @ApiProperty({ example: 'ナルト' })
  other_title: string | null;

  @ApiProperty({ example: 2002 })
  year: number | null;

  @ApiProperty({ example: 5 })
  last_season: number | null;

  @ApiProperty({ example: 220 })
  last_episode: number | null;

  @ApiProperty({ example: 220 })
  episodes_count: number | null;

  @ApiProperty({ example: '301' })
  kinopoisk_id: string | null;

  @ApiProperty({ example: 'tt0409591' })
  imdb_id: string | null;

  @ApiProperty({ example: '20' })
  shikimori_id: string | null;

  @ApiProperty({ example: '720p' })
  quality: string | null;

  @ApiProperty({ example: false })
  camrip: boolean | null;

  @ApiProperty({ example: false })
  lgbt: boolean | null;

  @ApiProperty()
  created_at: Date | null;

  @ApiProperty()
  updated_at: Date | null;

  @ApiProperty({ example: 'Описание аниме' })
  description: string | null;

  @ApiProperty({ example: 'Расширенное описание' })
  anime_description: string | null;

  @ApiProperty({ example: 'https://example.com/poster.jpg' })
  poster_url: string | null;

  @ApiProperty({ example: 'https://shikimori.org/poster.jpg' })
  anime_poster_url: string | null;

  @ApiProperty()
  premiere_world: Date | null;

  @ApiProperty()
  aried_at: Date | null;

  @ApiProperty()
  released_at: Date | null;

  @ApiProperty({ example: 'PG-13' })
  rating_mpaa: string | null;

  @ApiProperty({ example: 13 })
  minimal_age: number | null;

  @ApiProperty({ example: 220 })
  episodes_total: number | null;

  @ApiProperty({ example: 220 })
  episodes_aired: number | null;

  @ApiProperty({ example: 8.3 })
  imdb_rating: number | null;

  @ApiProperty({ example: 150000 })
  imdb_votes: number | null;

  @ApiProperty({ example: 8.5 })
  shikimori_rating?: number | null;

  @ApiProperty({ example: 50000 })
  shikimori_votes: number | null;

  @ApiProperty()
  next_episode_at: Date | null;

  @ApiProperty({ example: 'released' })
  all_status: string | null;

  @ApiProperty({ example: 'tv' })
  anime_kind: string | null;

  @ApiProperty({ example: 24 })
  duration: number | null;

  @ApiProperty({ type: [Object] })
  anime_genres: { genre: GenreDto | null }[];

  @ApiProperty({ type: [TranslationDto] })
  anime_translations: TranslationDto[];

  @ApiProperty({ type: [ScreenshotDto] })
  anime_screenshots: ScreenshotDto[];

  @ApiProperty({ type: [Object] })
  anime_persons: { person: PersonDto | null; role: string | null }[];

  @ApiProperty({ type: [Object] })
  anime_studios: { studio: StudioDto | null }[];

  @ApiProperty({ type: [BlockedCountryDto] })
  blocked_countries: BlockedCountryDto[];
}
