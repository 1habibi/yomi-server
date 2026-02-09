import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class TrackSearchDto {
  @ApiProperty({ example: 'наруто' })
  @IsString()
  @MaxLength(500)
  query: string;

  @ApiProperty({ example: 15, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  results_count?: number;

  @ApiProperty({ example: 123, description: 'ID аниме, на которое кликнул пользователь', required: false })
  @IsOptional()
  @IsInt()
  clicked_anime_id?: number;

  @ApiProperty({ example: 'abc123', required: false })
  @IsOptional()
  @IsString()
  session_id?: string;
}
