import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, IsEnum, Min, Max } from 'class-validator';

export class GetReviewsDto {
  @ApiPropertyOptional({
    description: 'Номер страницы',
    minimum: 1,
    default: 1,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Количество рецензий на странице',
    minimum: 1,
    maximum: 50,
    default: 20,
    example: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Сортировка',
    enum: ['newest', 'helpful', 'rating'],
    default: 'newest',
    example: 'newest',
  })
  @IsOptional()
  @IsEnum(['newest', 'helpful', 'rating'])
  sort_by?: 'newest' | 'helpful' | 'rating' = 'newest';
}
