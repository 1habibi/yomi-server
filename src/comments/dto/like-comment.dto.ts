import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class LikeCommentDto {
  @ApiProperty({
    description: 'true для лайка, false для дизлайка',
    example: true,
    type: Boolean,
  })
  @IsBoolean({ message: 'Значение должно быть булевым (true или false)' })
  is_like: boolean;
}
