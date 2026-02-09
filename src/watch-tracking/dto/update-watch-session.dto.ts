import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export class UpdateWatchSessionDto {
  @ApiProperty({ example: 720, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  watched_seconds?: number;

  @ApiProperty({ example: 900, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  max_position?: number;

  @ApiProperty({ example: 1.5, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0.25)
  @Max(4)
  playback_speed?: number;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  skipped_intro?: boolean;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  skipped_outro?: boolean;

  @ApiProperty({ example: 3, required: false })
  @IsOptional()
  @IsInt()
  seek_count?: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  pause_count?: number;
}
