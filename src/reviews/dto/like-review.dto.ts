import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class LikeReviewDto {
  @ApiProperty({
    description: 'true = лайк, false = дизлайк',
    example: true,
  })
  @IsBoolean()
  is_like: boolean;
}
