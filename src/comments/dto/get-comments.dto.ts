import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

export enum CommentSortBy {
  NEWEST = 'newest',
  POPULAR = 'popular',
  OLDEST = 'oldest',
}

export class GetCommentsDto {
  @ApiPropertyOptional({
    description: 'Номер страницы',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Номер страницы должен быть целым числом' })
  @Min(1, { message: 'Номер страницы не может быть меньше 1' })
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Количество комментариев на странице',
    example: 20,
    minimum: 1,
    maximum: 50,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Лимит должен быть целым числом' })
  @Min(1, { message: 'Лимит не может быть меньше 1' })
  @Max(50, { message: 'Лимит не может быть больше 50' })
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Сортировка комментариев',
    enum: CommentSortBy,
    example: CommentSortBy.NEWEST,
    default: CommentSortBy.NEWEST,
  })
  @IsOptional()
  @IsEnum(CommentSortBy, { message: 'Неверный тип сортировки' })
  sort_by?: CommentSortBy = CommentSortBy.NEWEST;
}
