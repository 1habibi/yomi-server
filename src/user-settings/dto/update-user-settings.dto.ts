import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateUserSettingsDto {
  @ApiProperty({
    description: 'Показывать ли списки другим пользователям',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  lists_are_public?: boolean;

  @ApiProperty({
    description: 'Показывать ли оценки другим пользователям',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  show_ratings_publicly?: boolean;
}
