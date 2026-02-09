import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class TrackPageViewDto {
  @ApiProperty({ example: 123 })
  @IsInt()
  anime_id: number;

  @ApiProperty({ example: 'abc123', required: false })
  @IsOptional()
  @IsString()
  session_id?: string;

  @ApiProperty({ example: 45000, description: 'Время на странице в мс', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  duration_ms?: number;

  @ApiProperty({
    example: 'search',
    description: 'Источник перехода: search | catalog | recommendation | similar | direct',
    required: false,
  })
  @IsOptional()
  @IsString()
  referrer?: string;
}
