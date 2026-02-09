import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsOptional, IsNumber, IsArray, Min, Max } from 'class-validator';
import { RecommendationAnimeDto } from './recommendation-response.dto';

export class DiscoveryQueryDto {
  @ApiProperty({
    description: 'Естественное описание желаемого аниме',
    example: 'Хочу мрачное аниме про психологию и философию',
  })
  @IsString()
  query: string;

  @ApiPropertyOptional({
    description: 'Количество результатов',
    example: 20,
    minimum: 1,
    maximum: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  top_n?: number = 20;

  @ApiPropertyOptional({
    description: 'Минимальный порог схожести (0-1)',
    example: 0.3,
    minimum: 0,
    maximum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  min_score?: number = 0.3;

  @ApiPropertyOptional({
    description: 'Явные жанры для фильтрации',
    example: ['Фэнтези', 'Драма'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  genres?: string[];

  @ApiPropertyOptional({
    description: 'Минимальный рейтинг аниме (0-10)',
    example: 7.5,
    minimum: 0,
    maximum: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(10)
  min_rating?: number;
}

export class ScoreBreakdownDto {
  @ApiProperty({ example: 0.782, description: 'Оценка семантической схожести' })
  semantic: number;

  @ApiProperty({ example: 0.667, description: 'Оценка совпадения жанров' })
  genre_match: number;

  @ApiProperty({ example: 0.75, description: 'Оценка популярности' })
  popularity: number;

  @ApiProperty({ example: 0.856, description: 'Финальная оценка' })
  final: number;

  @ApiProperty({ example: ['Психологическое', 'Драма'], description: 'Совпавшие жанры' })
  matched_genres: string[];
}

export class DiscoveryResultDto {
  @ApiProperty({ example: 123 })
  anime_id: number;

  @ApiProperty({ example: 0.856 })
  score: number;

  @ApiProperty({ type: String, example: 'Serial Experiments Lain', nullable: true })
  title: string | null;

  @ApiProperty({ example: ['Психологическое', 'Драма'], type: [String] })
  genres: string[];

  @ApiProperty({ type: Number, example: 1998, nullable: true })
  year: number | null;

  @ApiProperty({ type: Number, example: 8.1, nullable: true })
  rating: number | null;

  @ApiProperty({ type: ScoreBreakdownDto })
  score_breakdown: ScoreBreakdownDto;

  @ApiProperty({ type: RecommendationAnimeDto, description: 'Полные данные аниме из БД' })
  anime: RecommendationAnimeDto;
}

export class ParsedQueryDto {
  @ApiProperty({ example: ['Фэнтези'], type: [String] })
  genres: string[];

  @ApiProperty({ example: ['dark', 'atmospheric'], type: [String] })
  moods: string[];

  @ApiProperty({ example: ['magic', 'revenge'], type: [String] })
  themes: string[];

  @ApiProperty({ example: [2020], type: [Number] })
  year_hints: number[];
}

export class DiscoveryResponseDto {
  @ApiProperty({ type: [DiscoveryResultDto] })
  results: DiscoveryResultDto[];

  @ApiProperty({ type: ParsedQueryDto })
  parsed_query: ParsedQueryDto;

  @ApiProperty({ example: 15 })
  total: number;

  @ApiProperty({ example: 'Хочу мрачное аниме про психологию' })
  query: string;
}
