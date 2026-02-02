import { ApiProperty } from '@nestjs/swagger';
import { InteractionType } from '@prisma/client';
import { IsEnum, IsInt } from 'class-validator';

export class AddToListDto {
  @ApiProperty({
    description: 'ID аниме',
    example: 123,
  })
  @IsInt()
  anime_id: number;

  @ApiProperty({
    description: 'Тип списка',
    enum: InteractionType,
    example: InteractionType.WATCHING,
  })
  @IsEnum(InteractionType)
  list_type: InteractionType;
}
