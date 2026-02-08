import { ApiProperty } from '@nestjs/swagger';
import { ActivityType } from '@prisma/client';

export class ActivityUserDto {
  @ApiProperty({ example: 'cmiuam7t00000u688exiu8oqz' })
  id: string;

  @ApiProperty({ example: 'username' })
  name: string;

  @ApiProperty({
    example: 'https://s3.ru-1.storage.selcloud.ru/yomi-avatars/avatars/avatar-123.webp',
    nullable: true,
  })
  avatar_url: string | null;
}

export class ActivityAnimeDto {
  @ApiProperty({ example: 123 })
  id: number;

  @ApiProperty({ example: 'Название аниме', nullable: true })
  title: string | null;

  @ApiProperty({ example: 'Original Title', nullable: true })
  title_orig: string | null;

  @ApiProperty({
    example: 'https://example.com/poster.jpg',
    nullable: true,
  })
  poster_url: string | null;
}

export class ActivityResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({
    enum: ActivityType,
    example: ActivityType.ANIME_ADDED_TO_LIST,
  })
  type: ActivityType;

  @ApiProperty({ type: ActivityUserDto })
  user: ActivityUserDto;

  @ApiProperty({ type: ActivityAnimeDto, nullable: true })
  anime: ActivityAnimeDto | null;

  @ApiProperty({
    example: { old_status: 'WATCHING', new_status: 'WATCHED' },
    nullable: true,
    description: 'Дополнительные данные активности',
  })
  metadata: any;

  @ApiProperty({ example: '2025-02-03T12:00:00.000Z' })
  created_at: Date;
}

export class PaginatedActivityResponseDto {
  @ApiProperty({ type: [ActivityResponseDto] })
  activities: ActivityResponseDto[];

  @ApiProperty({ example: 150 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 8 })
  total_pages: number;
}
