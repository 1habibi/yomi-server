import { ApiProperty } from '@nestjs/swagger';
import { InteractionType } from '@prisma/client';
import { IsArray, IsEnum, IsInt } from 'class-validator';

export class ReorderListDto {
  @ApiProperty({
    description: 'Тип списка для пересортировки',
    enum: InteractionType,
    example: InteractionType.WATCHING,
  })
  @IsEnum(InteractionType)
  list_type: InteractionType;

  @ApiProperty({
    description: 'Массив ID аниме в новом порядке',
    type: [Number],
    example: [5, 3, 1, 8, 2],
  })
  @IsArray()
  @IsInt({ each: true })
  anime_ids: number[];
}
