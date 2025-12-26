import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export enum AnimeSortField {
  TITLE = 'title',
  YEAR = 'year',
  UPDATED_AT = 'updated_at',
  CREATED_AT = 'created_at'
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc'
}

export class GetAnimeDto {
  @ApiPropertyOptional({ 
    description: 'Номер страницы для пагинации',
    minimum: 1,
    default: 1 
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
    default: 20
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
    enumName: 'AnimeSortField',
    default: AnimeSortField.TITLE,
    examples: [
      { value: AnimeSortField.TITLE, description: 'Сортировка по названию' },
      { value: AnimeSortField.YEAR, description: 'Сортировка по году выхода' },
      { value: AnimeSortField.UPDATED_AT, description: 'Сортировка по дате обновления' },
      { value: AnimeSortField.CREATED_AT, description: 'Сортировка по дате создания' }
    ]
  })
  @IsOptional()
  @IsEnum(AnimeSortField)
  sort_by?: AnimeSortField = AnimeSortField.TITLE;

  @ApiPropertyOptional({
    description: 'Порядок сортировки',
    enum: SortOrder,
    enumName: 'SortOrder',
    default: SortOrder.ASC,
    examples: [
      { value: SortOrder.ASC, description: 'По возрастанию (А-Я, 0-9)' },
      { value: SortOrder.DESC, description: 'По убыванию (Я-А, 9-0)' }
    ]
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
    description: 'Показывать только онгоинги',
    type: Boolean,
    default: false
  })
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => value === 'true' || value === true)
  only_ongoing?: boolean;

  @ApiPropertyOptional({
    description: 'Показывать только завершенные аниме',
    type: Boolean,
    default: false
  })
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => value === 'true' || value === true)
  only_completed?: boolean;

  @ApiPropertyOptional({
    description: 'Фильтр по жанру',
    example: 'экшен'
  })
  @IsOptional()
  @IsString()
  genre?: string;
}
