import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateWatchSessionDto {
  @ApiProperty({ example: 123 })
  @IsInt()
  anime_id: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  episode?: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  season?: number;

  @ApiProperty({ example: 610, required: false })
  @IsOptional()
  @IsInt()
  translation_id?: number;

  @ApiProperty({ example: 'AniDUB', required: false })
  @IsOptional()
  @IsString()
  translation_title?: string;

  @ApiProperty({ example: 1440, description: 'Длительность эпизода в секундах' })
  @IsInt()
  @Min(0)
  duration_seconds: number;
}
