import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

export class UpdateRatingDto {
  @ApiProperty({
    description: 'Новая оценка аниме (1-10)',
    minimum: 1,
    maximum: 10,
    example: 9,
  })
  @IsInt()
  @Min(1)
  @Max(10)
  rating: number;
}
