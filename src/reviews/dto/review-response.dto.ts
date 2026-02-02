import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReviewStatus } from '@prisma/client';

export class ReviewUserDto {
  @ApiProperty({ example: 'clxxx' })
  id: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  avatar_url?: string;
}

export class ReviewAnimeDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiPropertyOptional({ example: 'Наруто' })
  title?: string;

  @ApiPropertyOptional({ example: 'Naruto' })
  title_orig?: string;

  @ApiPropertyOptional({ example: 'https://example.com/poster.jpg' })
  poster_url?: string;
}

export class ReviewResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ type: ReviewUserDto })
  user: ReviewUserDto;

  @ApiProperty({ type: ReviewAnimeDto })
  anime: ReviewAnimeDto;

  @ApiProperty({ example: 'Великолепное аниме...' })
  content: string;

  @ApiProperty({ example: 9 })
  overall_rating: number;

  @ApiPropertyOptional({ example: 9 })
  story_rating?: number;

  @ApiPropertyOptional({ example: 10 })
  animation_rating?: number;

  @ApiPropertyOptional({ example: 8 })
  music_rating?: number;

  @ApiPropertyOptional({ example: 9 })
  characters_rating?: number;

  @ApiPropertyOptional({ example: 8 })
  voice_acting_rating?: number;

  @ApiProperty({ example: false })
  has_spoilers: boolean;

  @ApiProperty({ enum: ReviewStatus, example: 'APPROVED' })
  status: ReviewStatus;

  @ApiPropertyOptional({ example: 'Причина отклонения' })
  rejection_reason?: string;

  @ApiPropertyOptional({ example: '2024-01-15T12:00:00Z' })
  moderated_at?: Date;

  @ApiProperty({ example: 42 })
  likes_count: number;

  @ApiProperty({ example: 3 })
  dislikes_count: number;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  created_at: Date;

  @ApiProperty({ example: '2024-01-15T11:00:00Z' })
  updated_at: Date;

  @ApiPropertyOptional({
    description: 'Реакция текущего пользователя (только если авторизован)',
    example: true,
    type: Boolean,
    nullable: true,
  })
  user_reaction?: boolean | null;
}
