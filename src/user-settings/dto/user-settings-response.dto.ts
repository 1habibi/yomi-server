import { ApiProperty } from '@nestjs/swagger';

export class UserSettingsResponseDto {
  @ApiProperty({ example: 'cuid123' })
  id: string;

  @ApiProperty({ example: true })
  lists_are_public: boolean;

  @ApiProperty({ example: true })
  show_ratings_publicly: boolean;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  created_at: Date;

  @ApiProperty({ example: '2024-01-20T15:45:00Z' })
  updated_at: Date;
}
