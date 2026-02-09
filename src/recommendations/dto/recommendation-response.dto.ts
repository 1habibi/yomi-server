import { ApiProperty } from '@nestjs/swagger';

export class RecommendationItemDto {
  @ApiProperty({ example: 123 })
  anime_id: number;

  @ApiProperty({ example: 0.85 })
  score: number;

  @ApiProperty({ example: 'cf' })
  source: string;
}

export class RecommendationAnimeDto {
  @ApiProperty({ example: 123 })
  id: number;

  @ApiProperty({ example: 'Наруто', type: String, nullable: true })
  title: string | null;

  @ApiProperty({ example: 'Naruto', type: String, nullable: true })
  title_orig: string | null;

  @ApiProperty({ example: 'https://...', type: String, nullable: true })
  poster_url: string | null;

  @ApiProperty({ example: 7.8, type: Number, nullable: true })
  shikimori_rating: number | null;

  @ApiProperty({ example: 2002, type: Number, nullable: true })
  year: number | null;

  @ApiProperty({ example: 'tv', type: String, nullable: true })
  anime_kind: string | null;
}

export class PersonalRecommendationDto extends RecommendationItemDto {
  @ApiProperty({ type: RecommendationAnimeDto })
  anime: RecommendationAnimeDto;
}

export class PersonalRecommendationsResponseDto {
  @ApiProperty({ type: [PersonalRecommendationDto] })
  recommendations: PersonalRecommendationDto[];

  @ApiProperty({ example: 20 })
  total: number;

  @ApiProperty({ example: 'active' })
  user_type: string;
}

export class SimilarAnimeResponseDto {
  @ApiProperty({ example: 123 })
  anime_id: number;

  @ApiProperty({ type: [PersonalRecommendationDto] })
  similar: PersonalRecommendationDto[];

  @ApiProperty({ example: 10 })
  total: number;
}

export class PopularAnimeResponseDto {
  @ApiProperty({ type: [PersonalRecommendationDto] })
  items: PersonalRecommendationDto[];

  @ApiProperty({ example: 20 })
  total: number;
}

export class TrendingAnimeResponseDto {
  @ApiProperty({ type: [PersonalRecommendationDto] })
  items: PersonalRecommendationDto[];

  @ApiProperty({ example: 20 })
  total: number;
}
