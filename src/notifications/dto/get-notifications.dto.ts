import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';

export class GetNotificationsDto {
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
    description: 'Количество уведомлений на странице',
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
    description: 'Фильтр по статусу прочтения (true = только непрочитанные, false = только прочитанные)',
    example: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean({ message: 'Значение должно быть булевым' })
  is_read?: boolean;
}
