import { ApiProperty } from '@nestjs/swagger';
import { MessageStatus } from '@prisma/client';

export class MessageUserDto {
  @ApiProperty({ example: 'cmiuam7t00000u688exiu8oqz' })
  id: string;

  @ApiProperty({ example: 'username' })
  name: string;

  @ApiProperty({
    type: String,
    example: 'https://s3.ru-1.storage.selcloud.ru/yomi-avatars/avatars/avatar-123.webp',
    nullable: true,
  })
  avatar_url: string | null;

  @ApiProperty({
    type: Boolean,
    example: true,
    description: 'Онлайн ли пользователь (null если скрыл статус)',
    nullable: true,
  })
  is_online?: boolean | null;
}

export class MessageResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  conversation_id: number;

  @ApiProperty({ type: MessageUserDto })
  sender: MessageUserDto;

  @ApiProperty({ example: 'Привет! Как дела?' })
  content: string;

  @ApiProperty({
    example: 'https://example.com/image.jpg',
    nullable: true,
  })
  image_url: string | null;

  @ApiProperty({ enum: MessageStatus, example: MessageStatus.SENT })
  status: MessageStatus;

  @ApiProperty({ example: '2025-02-03T12:01:00.000Z', nullable: true })
  delivered_at: Date | null;

  @ApiProperty({ example: '2025-02-03T12:02:00.000Z', nullable: true })
  read_at: Date | null;

  @ApiProperty({ example: false })
  is_edited: boolean;

  @ApiProperty({ example: null, nullable: true })
  edited_at: Date | null;

  @ApiProperty({ example: false })
  is_deleted: boolean;

  @ApiProperty({ example: '2025-02-03T12:00:00.000Z' })
  created_at: Date;
}

export class ConversationResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ type: MessageUserDto })
  participant: MessageUserDto;

  @ApiProperty({ type: MessageResponseDto, nullable: true })
  last_message: MessageResponseDto | null;

  @ApiProperty({ example: '2025-02-03T12:00:00.000Z', nullable: true })
  last_message_at: Date | null;

  @ApiProperty({ example: 5 })
  unread_count: number;

  @ApiProperty({ example: '2025-02-03T11:00:00.000Z' })
  created_at: Date;
}

export class PaginatedMessagesResponseDto {
  @ApiProperty({ type: [MessageResponseDto] })
  messages: MessageResponseDto[];

  @ApiProperty({ example: 150 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 50 })
  limit: number;

  @ApiProperty({ example: 3 })
  total_pages: number;
}

export class PaginatedConversationsResponseDto {
  @ApiProperty({ type: [ConversationResponseDto] })
  conversations: ConversationResponseDto[];

  @ApiProperty({ example: 10 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 1 })
  total_pages: number;
}
