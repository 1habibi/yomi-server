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

  @ApiProperty({ example: 'Наруто', nullable: true })
  title: string | null;

  @ApiProperty({ example: 'Naruto', nullable: true })
  title_orig: string | null;

  @ApiProperty({ example: 'https://...', nullable: true })
  poster_url: string | null;

  @ApiProperty({ example: 7.8, nullable: true })
  shikimori_rating: number | null;

  @ApiProperty({ example: 2002, nullable: true })
  year: number | null;

  @ApiProperty({ example: 'tv', nullable: true })
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
