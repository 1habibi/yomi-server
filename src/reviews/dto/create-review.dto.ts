import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsString,
  IsBoolean,
  IsOptional,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({
    description: 'ID аниме',
    example: 1,
  })
  @IsInt()
  anime_id: number;

  @ApiProperty({
    description: 'Текст рецензии',
    minLength: 200,
    maxLength: 10000,
    example: 'Великолепное аниме с потрясающим сюжетом...',
  })
  @IsString()
  @MinLength(200, { message: 'Минимальная длина рецензии - 200 символов' })
  @MaxLength(10000, { message: 'Максимальная длина рецензии - 10000 символов' })
  content: string;

  @ApiProperty({
    description: 'Общая оценка (обязательно)',
    minimum: 1,
    maximum: 10,
    example: 9,
  })
  @IsInt()
  @Min(1)
  @Max(10)
  overall_rating: number;

  @ApiPropertyOptional({
    description: 'Оценка сюжета',
    minimum: 1,
    maximum: 10,
    example: 9,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  story_rating?: number;

  @ApiPropertyOptional({
    description: 'Оценка анимации',
    minimum: 1,
    maximum: 10,
    example: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  animation_rating?: number;

  @ApiPropertyOptional({
    description: 'Оценка музыки',
    minimum: 1,
    maximum: 10,
    example: 8,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  music_rating?: number;

  @ApiPropertyOptional({
    description: 'Оценка персонажей',
    minimum: 1,
    maximum: 10,
    example: 9,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  characters_rating?: number;

  @ApiPropertyOptional({
    description: 'Оценка озвучки',
    minimum: 1,
    maximum: 10,
    example: 8,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  voice_acting_rating?: number;

  @ApiPropertyOptional({
    description: 'Содержит спойлеры',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  has_spoilers?: boolean = false;
}
