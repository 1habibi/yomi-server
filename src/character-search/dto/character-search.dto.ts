import { ApiProperty } from '@nestjs/swagger';

// --- Single search ---
export class CharacterResultDto {
  @ApiProperty({ description: 'Название аниме (romaji)' })
  anime: string;

  @ApiProperty({ description: 'Полное имя персонажа' })
  character: string;

  @ApiProperty({ description: 'Similarity score 0-1' })
  similarity: number;

  @ApiProperty({ type: [String], description: 'Все аниме с этим персонажем' })
  all_anime: string[];

  @ApiProperty({ description: 'ID персонажа в базе AniList' })
  character_id: number;
}

export class AnimeAggregatedResultDto {
  @ApiProperty() anime: string;
  @ApiProperty() score: number;
  @ApiProperty({ type: 'array', items: { type: 'object' } })
  characters: Record<string, unknown>[];
  @ApiProperty() match_count: number;
  @ApiProperty() best_similarity: number;
  @ApiProperty({ enum: ['very_high', 'high', 'medium', 'low'] })
  confidence: string;
}

export class SearchResponseDto {
  @ApiProperty({ type: [CharacterResultDto] })
  results: CharacterResultDto[];

  @ApiProperty({ type: [AnimeAggregatedResultDto] })
  aggregated: AnimeAggregatedResultDto[];

  @ApiProperty({ description: 'Лучшее совпадение по аниме' })
  top_anime: string;

  @ApiProperty({ enum: ['very_high', 'high', 'medium', 'low'] })
  confidence: string;

  @ApiProperty({ required: false, description: 'Результат отфильтрован по текущему аниме' })
  context_filtered?: boolean;
}

// --- Multi search ---
export class BoundingBoxDto {
  @ApiProperty() x: number;
  @ApiProperty() y: number;
  @ApiProperty() width: number;
  @ApiProperty() height: number;
  @ApiProperty() confidence: number;
}

export class CharacterCandidateDto {
  @ApiProperty() character: string;
  @ApiProperty() anime: string;
  @ApiProperty() character_id: number;
  @ApiProperty() similarity: number;
  @ApiProperty({ type: [String] }) all_anime: string[];
}

export class DetectedCharacterDto {
  @ApiProperty() character: string;
  @ApiProperty() anime: string;
  @ApiProperty() character_id: number;
  @ApiProperty() similarity: number;
  @ApiProperty({ type: () => BoundingBoxDto }) bbox: BoundingBoxDto;
  @ApiProperty({ enum: ['very_high', 'high', 'medium', 'low'] }) confidence: string;
  @ApiProperty({ type: [CharacterCandidateDto] }) alternatives: CharacterCandidateDto[];
}

export class MultiSearchResponseDto {
  @ApiProperty({ type: [DetectedCharacterDto] })
  detected_characters: DetectedCharacterDto[];

  @ApiProperty() total_detected: number;

  @ApiProperty({ type: [AnimeAggregatedResultDto] })
  anime_summary: AnimeAggregatedResultDto[];

  @ApiProperty() detection_method: string;

  @ApiProperty({ required: false, description: 'Результат отфильтрован по текущему аниме' })
  context_filtered?: boolean;
}
