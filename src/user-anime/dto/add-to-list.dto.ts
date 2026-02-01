import { ApiProperty } from '@nestjs/swagger';
import { InteractionType } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

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

  @ApiProperty({
    description: 'Оценка аниме (1-10)',
    minimum: 1,
    maximum: 10,
    required: false,
    example: 8,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  rating?: number;
}
