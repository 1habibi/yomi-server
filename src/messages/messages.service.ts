import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MessageStatus, MessageVisibility } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { WebSocketService } from '../websocket/websocket.service';
import { CreateMessageDto, EditMessageDto } from './dto/create-message.dto';
import { GetMessagesDto } from './dto/get-messages.dto';
import {
  ConversationResponseDto,
  MessageResponseDto,
  PaginatedConversationsResponseDto,
  PaginatedMessagesResponseDto,
} from './dto/message-response.dto';

@Injectable()
export class MessagesService {
  constructor(
    private prisma: PrismaService,
    private webSocketService: WebSocketService,
  ) {}

  /**
   * Получить все диалоги пользователя
   */
  async getConversations(
    userId: string,
    dto: GetMessagesDto,
  ): Promise<PaginatedConversationsResponseDto> {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const skip = (page - 1) * limit;

    const [conversations, total] = await Promise.all([
      this.prisma.conversation.findMany({
        where: {
          OR: [{ participant_1: userId }, { participant_2: userId }],
        },
        skip,
        take: limit,
        orderBy: { last_message_at: 'desc' },
        include: {
          user_1: {
            select: { id: true, name: true, avatar_url: true },
          },
          user_2: {
            select: { id: true, name: true, avatar_url: true },
          },
          messages: {
            take: 1,
            orderBy: { created_at: 'desc' },
            include: {
              sender: {
                select: { id: true, name: true, avatar_url: true },
              },
            },
          },
        },
      }),
      this.prisma.conversation.count({
        where: {
          OR: [{ participant_1: userId }, { participant_2: userId }],
        },
      }),
    ]);

    const participantIds = conversations.map((conv) =>
      conv.participant_1 === userId ? conv.user_2.id : conv.user_1.id,
    );

    const participantSettings = await this.prisma.userSettings.findMany({
      where: { user_id: { in: participantIds } },
      select: { user_id: true, show_online_status: true },
    });
    const onlineSettingsMap = new Map(
      participantSettings.map((s) => [s.user_id, s.show_online_status]),
    );

    const visibleParticipantIds = participantIds.filter(
      (id) => onlineSettingsMap.get(id) !== false,
    );
    const onlineUserIds =
      visibleParticipantIds.length > 0
        ? await this.webSocketService.getOnlineUsers(visibleParticipantIds)
        : [];
    const onlineSet = new Set(onlineUserIds);

    const conversationsDto: ConversationResponseDto[] = await Promise.all(
      conversations.map(async (conv) => {
        const participant =
          conv.participant_1 === userId ? conv.user_2 : conv.user_1;

        const unreadCount = await this.prisma.message.count({
          where: {
            conversation_id: conv.id,
            sender_id: { not: userId },
            status: { not: MessageStatus.READ },
          },
        });

        const lastMessage = conv.messages[0];

        const showOnline = onlineSettingsMap.get(participant.id) !== false;
        const participantIsOnline = showOnline
          ? onlineSet.has(participant.id)
          : null;

        return {
          id: conv.id,
          participant: {
            id: participant.id,
            name: participant.name,
            avatar_url: participant.avatar_url,
            is_online: participantIsOnline,
          },
          last_message: lastMessage
            ? {
                id: lastMessage.id,
                conversation_id: lastMessage.conversation_id,
                sender: {
                  id: lastMessage.sender.id,
                  name: lastMessage.sender.name,
                  avatar_url: lastMessage.sender.avatar_url,
                },
                content: lastMessage.content,
                image_url: lastMessage.image_url,
                status: lastMessage.status,
                delivered_at: lastMessage.delivered_at,
                read_at: lastMessage.read_at,
                is_edited: lastMessage.is_edited,
                edited_at: lastMessage.edited_at,
                is_deleted: lastMessage.is_deleted,
                created_at: lastMessage.created_at,
              }
            : null,
          last_message_at: conv.last_message_at,
          unread_count: unreadCount,
          created_at: conv.created_at,
        };
      }),
    );

    return {
      conversations: conversationsDto,
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }

  /**
   * Получить или создать диалог с пользователем
   */
  async getOrCreateConversation(
    userId: string,
    targetUserId: string,
  ): Promise<{ id: number }> {
    if (userId === targetUserId) {
      throw new BadRequestException('Нельзя создать диалог с самим собой');
    }

    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });
    if (!targetUser) {
      throw new NotFoundException('Пользователь не найден');
    }

    const isBlocked = await this.prisma.userBlock.findFirst({
      where: {
        OR: [
          { blocker_id: userId, blocked_id: targetUserId },
          { blocker_id: targetUserId, blocked_id: userId },
        ],
      },
    });
    if (isBlocked) {
      throw new ForbiddenException('Переписка невозможна из-за блокировки');
    }

    await this.checkMessagePermission(userId, targetUserId);

    let conversation = await this.prisma.conversation.findFirst({
      where: {
        OR: [
          { participant_1: userId, participant_2: targetUserId },
          { participant_1: targetUserId, participant_2: userId },
        ],
      },
    });

    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: {
          participant_1: userId,
          participant_2: targetUserId,
        },
      });
    }

    return { id: conversation.id };
  }

  /**
   * Получить сообщения диалога
   */
  async getMessages(
    userId: string,
    conversationId: number,
    dto: GetMessagesDto,
  ): Promise<PaginatedMessagesResponseDto> {
    const conversation = await this.verifyConversationAccess(
      userId,
      conversationId,
    );

    const page = dto.page ?? 1;
    const limit = dto.limit ?? 50;
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where: { conversation_id: conversationId },
        skip,
        take: limit,
        orderBy: { created_at: 'asc' },
        include: {
          sender: {
            select: { id: true, name: true, avatar_url: true },
          },
        },
      }),
      this.prisma.message.count({
        where: { conversation_id: conversationId },
      }),
    ]);

    return {
      messages: messages.map((msg) => ({
        id: msg.id,
        conversation_id: msg.conversation_id,
        sender: {
          id: msg.sender.id,
          name: msg.sender.name,
          avatar_url: msg.sender.avatar_url,
        },
        content: msg.content,
        image_url: msg.image_url,
        status: msg.status,
        delivered_at: msg.delivered_at,
        read_at: msg.read_at,
        is_edited: msg.is_edited,
        edited_at: msg.edited_at,
        is_deleted: msg.is_deleted,
        created_at: msg.created_at,
      })),
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }

  /**
   * Отправить сообщение
   */
  async sendMessage(
    userId: string,
    conversationId: number,
    dto: CreateMessageDto,
  ): Promise<MessageResponseDto> {
    await this.verifyConversationAccess(userId, conversationId);

    const message = await this.prisma.$transaction(async (tx) => {
      const newMessage = await tx.message.create({
        data: {
          conversation_id: conversationId,
          sender_id: userId,
          content: dto.content,
          image_url: dto.image_url,
          status: MessageStatus.SENT,
        },
        include: {
          sender: {
            select: { id: true, name: true, avatar_url: true },
          },
        },
      });

      await tx.conversation.update({
        where: { id: conversationId },
        data: { last_message_at: newMessage.created_at },
      });

      return newMessage;
    });

    return {
      id: message.id,
      conversation_id: message.conversation_id,
      sender: {
        id: message.sender.id,
        name: message.sender.name,
        avatar_url: message.sender.avatar_url,
      },
      content: message.content,
      image_url: message.image_url,
      status: message.status,
      delivered_at: message.delivered_at,
      read_at: message.read_at,
      is_edited: message.is_edited,
      edited_at: message.edited_at,
      is_deleted: message.is_deleted,
      created_at: message.created_at,
    };
  }

  /**
   * Редактировать сообщение
   */
  async editMessage(
    userId: string,
    messageId: number,
    dto: EditMessageDto,
  ): Promise<MessageResponseDto> {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Сообщение не найдено');
    }

    if (message.sender_id !== userId) {
      throw new ForbiddenException('Вы можете редактировать только свои сообщения');
    }

    if (message.is_deleted) {
      throw new BadRequestException('Нельзя редактировать удаленное сообщение');
    }

    const updated = await this.prisma.message.update({
      where: { id: messageId },
      data: {
        content: dto.content,
        is_edited: true,
        edited_at: new Date(),
      },
      include: {
        sender: {
          select: { id: true, name: true, avatar_url: true },
        },
      },
    });

    return {
      id: updated.id,
      conversation_id: updated.conversation_id,
      sender: {
        id: updated.sender.id,
        name: updated.sender.name,
        avatar_url: updated.sender.avatar_url,
      },
      content: updated.content,
      image_url: updated.image_url,
      status: updated.status,
      delivered_at: updated.delivered_at,
      read_at: updated.read_at,
      is_edited: updated.is_edited,
      edited_at: updated.edited_at,
      is_deleted: updated.is_deleted,
      created_at: updated.created_at,
    };
  }

  /**
   * Удалить сообщение
   */
  async deleteMessage(userId: string, messageId: number): Promise<{ message: string }> {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Сообщение не найдено');
    }

    if (message.sender_id !== userId) {
      throw new ForbiddenException('Вы можете удалять только свои сообщения');
    }

    await this.prisma.message.update({
      where: { id: messageId },
      data: {
        is_deleted: true,
        deleted_at: new Date(),
        content: '[Сообщение удалено]',
      },
    });

    return { message: 'Сообщение удалено' };
  }

  /**
   * Отметить сообщения как прочитанные
   */
  async markAsRead(userId: string, conversationId: number): Promise<{ message: string }> {
    await this.verifyConversationAccess(userId, conversationId);

    await this.prisma.message.updateMany({
      where: {
        conversation_id: conversationId,
        sender_id: { not: userId },
        status: { not: MessageStatus.READ },
      },
      data: {
        status: MessageStatus.READ,
        read_at: new Date(),
      },
    });

    return { message: 'Сообщения отмечены как прочитанные' };
  }

  /**
   * Проверить доступ к диалогу
   */
  private async verifyConversationAccess(
    userId: string,
    conversationId: number,
  ) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Диалог не найден');
    }

    if (
      conversation.participant_1 !== userId &&
      conversation.participant_2 !== userId
    ) {
      throw new ForbiddenException('У вас нет доступа к этому диалогу');
    }

    return conversation;
  }

  /**
   * Проверить разрешение на отправку сообщений
   */
  private async checkMessagePermission(
    senderId: string,
    receiverId: string,
  ): Promise<void> {
    const settings = await this.prisma.userSettings.findUnique({
      where: { user_id: receiverId },
      select: { message_visibility: true },
    });

    if (!settings) {
      return;
    }

    const visibility = settings.message_visibility;

    if (visibility === MessageVisibility.EVERYONE) {
      return;
    }

    if (visibility === MessageVisibility.FOLLOWERS_ONLY) {
      const isFollower = await this.prisma.userFollow.findUnique({
        where: {
          follower_id_following_id: {
            follower_id: senderId,
            following_id: receiverId,
          },
        },
      });

      if (!isFollower) {
        throw new ForbiddenException(
          'Этот пользователь принимает сообщения только от подписчиков',
        );
      }
    }

    if (visibility === MessageVisibility.MUTUAL_ONLY) {
      const [isFollower, isFollowing] = await Promise.all([
        this.prisma.userFollow.findUnique({
          where: {
            follower_id_following_id: {
              follower_id: senderId,
              following_id: receiverId,
            },
          },
        }),
        this.prisma.userFollow.findUnique({
          where: {
            follower_id_following_id: {
              follower_id: receiverId,
              following_id: senderId,
            },
          },
        }),
      ]);

      if (!isFollower || !isFollowing) {
        throw new ForbiddenException(
          'Этот пользователь принимает сообщения только от взаимных подписчиков',
        );
      }
    }
  }
}
