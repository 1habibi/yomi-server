import { ApiProperty } from '@nestjs/swagger';

export class YearDistributionDto {
  @ApiProperty({ example: 2023 })
  year: number;

  @ApiProperty({ example: 42 })
  count: number;
}

export class StatsResponseDto {
  @ApiProperty({ example: 500, description: 'Общее количество аниме' })
  total: number;

  @ApiProperty({ example: 120, description: 'Количество онгоингов' })
  ongoing: number;

  @ApiProperty({ example: 380, description: 'Количество завершенных аниме' })
  completed: number;

  @ApiProperty({ example: 7.8, description: 'Средний рейтинг Shikimori' })
  average_rating: number;

  @ApiProperty({ 
    type: [YearDistributionDto],
    description: 'Распределение аниме по годам'
  })
  years_distribution: YearDistributionDto[];
}
