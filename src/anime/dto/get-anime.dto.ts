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
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(AnimeSortField)
  sort_by?: AnimeSortField = AnimeSortField.TITLE;

  @IsOptional()
  @IsEnum(SortOrder)
  sort_order?: SortOrder = SortOrder.ASC;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  year_from?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  year_to?: number;

  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => value === 'true' || value === true)
  only_ongoing?: boolean;

  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => value === 'true' || value === true)
  only_completed?: boolean;

  @IsOptional()
  @IsString()
  genre?: string;
}
