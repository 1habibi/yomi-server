import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';

export class NotificationActorDto {
  @ApiProperty({
    description: 'ID пользователя, который совершил действие',
    example: 'clxyz123abc',
  })
  id: string;

  @ApiProperty({
    description: 'Имя пользователя',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'URL аватара',
    example: 'https://example.com/avatar.jpg',
    nullable: true,
    type: () => String,
  })
  avatar_url: string | null;
}

export class NotificationResponseDto {
  @ApiProperty({
    description: 'ID уведомления',
    example: 42,
  })
  id: number;

  @ApiProperty({
    description: 'Тип уведомления',
    enum: NotificationType,
    example: NotificationType.COMMENT_REPLY,
  })
  type: NotificationType;

  @ApiProperty({
    description: 'Информация о пользователе, который совершил действие',
    type: NotificationActorDto,
  })
  actor: NotificationActorDto;

  @ApiProperty({
    description: 'ID комментария, связанного с уведомлением',
    example: 123,
    nullable: true,
    type: () => Number,
  })
  comment_id: number | null;

  @ApiProperty({
    description: 'ID аниме, связанного с уведомлением',
    example: 456,
    nullable: true,
    type: () => Number,
  })
  anime_id: number | null;

  @ApiProperty({
    description: 'Статус прочтения',
    example: false,
  })
  is_read: boolean;

  @ApiProperty({
    description: 'Дата прочтения',
    example: '2024-01-26T12:00:00.000Z',
    nullable: true,
    type: () => Date,
  })
  read_at: Date | null;

  @ApiProperty({
    description: 'Дата создания уведомления',
    example: '2024-01-26T11:00:00.000Z',
  })
  created_at: Date;
}
