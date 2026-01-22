import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export enum AnimeSortField {
  TITLE = 'title',
  YEAR = 'year',
  UPDATED_AT = 'updated_at',
  CREATED_AT = 'created_at',
  SHIKIMORI_RATING = 'shikimori_rating'
}

export enum AnimeStatus {
  ONGOING = 'ongoing',
  RELEASED = 'released',
  ANONS = 'anons',
  UNKNOWN = 'unknown',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc'
}

export class GetAnimeDto {
  @ApiPropertyOptional({ 
    description: 'Номер страницы для пагинации',
    minimum: 1,
    default: 1,
    example: 1 // Используйте example (ед.ч) для простых типов
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Количество элементов на странице',
    minimum: 1,
    maximum: 100,
    default: 20,
    example: 20
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Поисковый запрос для фильтрации аниме по названию',
    example: 'Наруто'
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ 
    description: 'Поле для сортировки',
    enum: AnimeSortField,
    enumName: 'AnimeSortField', // Важно для генерации правильного типа в Orval
    default: AnimeSortField.TITLE,
    // УБРАЛИ examples: [...] — Swagger сам покажет список из enum
  })
  @IsOptional()
  @IsEnum(AnimeSortField)
  sort_by?: AnimeSortField = AnimeSortField.TITLE;

  @ApiPropertyOptional({
    description: 'Порядок сортировки',
    enum: SortOrder,
    enumName: 'SortOrder',
    default: SortOrder.ASC,
    // УБРАЛИ examples: [...]
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sort_order?: SortOrder = SortOrder.ASC;

  @ApiPropertyOptional({
    description: 'Фильтр по минимальному году выхода',
    minimum: 1900,
    example: 2020
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  year_from?: number;

  @ApiPropertyOptional({
    description: 'Фильтр по максимальному году выхода',
    minimum: 1900,
    example: 2023
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  year_to?: number;

  @ApiPropertyOptional({
    description: 'Фильтр по статусу аниме',
    enum: AnimeStatus,
    enumName: 'AnimeStatus',
    example: AnimeStatus.ONGOING,
  })
  @IsOptional()
  @IsEnum(AnimeStatus)
  status?: AnimeStatus;

  @ApiPropertyOptional({
    description: 'Фильтр по жанру',
    example: 'экшен'
  })
  @IsOptional()
  @IsString()
  genre?: string;

  @ApiPropertyOptional({
    description: 'Фильтр по минимальному рейтингу',
    minimum: 0,
    maximum: 10,
    example: 7
  })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  @Max(10)
  rating_from?: number;

  @ApiPropertyOptional({
    description: 'Фильтр по максимальному рейтингу',
    minimum: 0,
    maximum: 10,
    example: 9
  })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  @Max(10)
  rating_to?: number;
}