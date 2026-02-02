import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { GetNotificationsDto } from './dto/get-notifications.dto';
import { NotificationResponseDto } from './dto/notification-response.dto';
import { PaginatedNotificationsResponseDto } from './dto/paginated-notifications-response.dto';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    userId: string,
    dto: GetNotificationsDto,
  ): Promise<PaginatedNotificationsResponseDto> {
    const { page = 1, limit = 20, is_read } = dto;

    if (page < 1) {
      throw new BadRequestException('Номер страницы должен быть больше 0');
    }

    const skip = (page - 1) * limit;

    const where: Prisma.NotificationWhereInput = {
      user_id: userId,
    };

    if (is_read !== undefined) {
      where.is_read = is_read;
    }

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        include: {
          actor: {
            select: {
              id: true,
              name: true,
              avatar_url: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
    ]);

    const formattedNotifications: NotificationResponseDto[] = notifications.map((notification) => ({
      id: notification.id,
      type: notification.type,
      actor: {
        id: notification.actor.id,
        name: notification.actor.name,
        avatar_url: notification.actor.avatar_url,
      },
      comment_id: notification.comment_id,
      anime_id: notification.anime_id,
      is_read: notification.is_read,
      read_at: notification.read_at,
      created_at: notification.created_at,
    }));

    return {
      data: formattedNotifications,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
        has_prev: page > 1,
        has_next: page < Math.ceil(total / limit),
      },
    };
  }

  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.prisma.notification.count({
      where: {
        user_id: userId,
        is_read: false,
      },
    });

    return { count };
  }

  async markAsRead(id: number, userId: string): Promise<NotificationResponseDto> {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException(`Уведомление с ID ${id} не найдено`);
    }

    if (notification.user_id !== userId) {
      throw new BadRequestException('Это не ваше уведомление');
    }

    const updated = await this.prisma.notification.update({
      where: { id },
      data: {
        is_read: true,
        read_at: new Date(),
      },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            avatar_url: true,
          },
        },
      },
    });

    return {
      id: updated.id,
      type: updated.type,
      actor: {
        id: updated.actor.id,
        name: updated.actor.name,
        avatar_url: updated.actor.avatar_url,
      },
      comment_id: updated.comment_id,
      anime_id: updated.anime_id,
      is_read: updated.is_read,
      read_at: updated.read_at,
      created_at: updated.created_at,
    };
  }

  async markAllAsRead(userId: string): Promise<{ message: string; count: number }> {
    const result = await this.prisma.notification.updateMany({
      where: {
        user_id: userId,
        is_read: false,
      },
      data: {
        is_read: true,
        read_at: new Date(),
      },
    });

    return {
      message: 'Все уведомления отмечены как прочитанные',
      count: result.count,
    };
  }

  async createReviewApprovedNotification(reviewId: number, userId: string, moderatorId: string): Promise<void> {
    await this.prisma.notification.create({
      data: {
        type: 'REVIEW_APPROVED',
        user_id: userId,
        actor_id: moderatorId,
      },
    });
  }

  async createReviewRejectedNotification(
    reviewId: number,
    userId: string,
    moderatorId: string,
  ): Promise<void> {
    await this.prisma.notification.create({
      data: {
        type: 'REVIEW_REJECTED',
        user_id: userId,
        actor_id: moderatorId,
        },
    });
  }
}
