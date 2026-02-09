import { ApiProperty } from '@nestjs/swagger';

export class WatchSessionResponseDto {
  @ApiProperty({ example: 1 })
  id: number;
}

export class EndWatchSessionResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 0.85, description: 'Процент просмотра от 0 до 1' })
  completion_ratio: number;
}
