import { ApiProperty } from '@nestjs/swagger';

export class BlockedUserDto {
  @ApiProperty({
    example: 'cmiuam7t00000u688exiu8oqz',
    description: 'ID пользователя',
  })
  id: string;

  @ApiProperty({
    example: 'username',
    description: 'Имя пользователя',
  })
  name: string;

  @ApiProperty({
    example: 'https://s3.ru-1.storage.selcloud.ru/yomi-avatars/avatars/avatar-123.webp',
    description: 'URL аватара',
    nullable: true,
  })
  avatar_url: string | null;
}

export class BlockResponseDto {
  @ApiProperty({
    example: 1,
    description: 'ID записи о блокировке',
  })
  id: number;

  @ApiProperty({
    type: BlockedUserDto,
    description: 'Данные заблокированного пользователя',
  })
  user: BlockedUserDto;

  @ApiProperty({
    example: '2025-02-03T12:00:00.000Z',
    description: 'Дата блокировки',
  })
  created_at: Date;
}

export class PaginatedBlocksResponseDto {
  @ApiProperty({
    type: [BlockResponseDto],
    description: 'Список заблокированных пользователей',
  })
  blocks: BlockResponseDto[];

  @ApiProperty({
    example: 5,
    description: 'Общее количество',
  })
  total: number;

  @ApiProperty({
    example: 1,
    description: 'Текущая страница',
  })
  page: number;

  @ApiProperty({
    example: 20,
    description: 'Лимит на странице',
  })
  limit: number;

  @ApiProperty({
    example: 1,
    description: 'Всего страниц',
  })
  total_pages: number;
}
