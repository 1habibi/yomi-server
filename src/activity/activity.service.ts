import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Visibility } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  PaginatedActivityResponseDto
} from './dto/activity-response.dto';
import { CreateActivityInternalDto } from './dto/create-activity.dto';
import { GetActivityDto } from './dto/get-activity.dto';

@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) {}

  /**
   * Создать запись об активности
   */
  async createActivity(dto: CreateActivityInternalDto): Promise<void> {
    await this.prisma.userActivity.create({
      data: {
        user_id: dto.userId,
        type: dto.type,
        anime_id: dto.animeId,
        review_id: dto.reviewId,
        comment_id: dto.commentId,
        metadata: dto.metadata,
      },
    });
  }

  /**
   * Получить активность пользователя
   */
  async getUserActivity(
    userId: string,
    dto: GetActivityDto,
    currentUserId?: string,
  ): Promise<PaginatedActivityResponseDto> {
    await this.checkActivityAccess(userId, currentUserId);

    return this.getActivities({ user_id: userId }, dto);
  }

  /**
   * Получить ленту активности друзей
   */
  async getFriendsActivity(
    userId: string,
    dto: GetActivityDto,
  ): Promise<PaginatedActivityResponseDto> {
    const following = await this.prisma.userFollow.findMany({
      where: { follower_id: userId },
      select: { following_id: true },
    });

    const followingIds = following.map((f) => f.following_id);

    if (followingIds.length === 0) {
      return {
        activities: [],
        total: 0,
        page: dto.page ?? 1,
        limit: dto.limit ?? 20,
        total_pages: 0,
      };
    }

    const usersWithPublicActivity = await this.prisma.userSettings.findMany({
      where: {
        user_id: { in: followingIds },
        activity_visibility: Visibility.PUBLIC,
      },
      select: { user_id: true },
    });

    const publicUserIds = usersWithPublicActivity.map((u) => u.user_id);

    if (publicUserIds.length === 0) {
      return {
        activities: [],
        total: 0,
        page: dto.page ?? 1,
        limit: dto.limit ?? 20,
        total_pages: 0,
      };
    }

    return this.getActivities({ user_id: { in: publicUserIds } }, dto);
  }

  /**
   * Получить активности с фильтром
   */
  private async getActivities(
    where: any,
    dto: GetActivityDto,
  ): Promise<PaginatedActivityResponseDto> {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      this.prisma.userActivity.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, avatar_url: true },
          },
          anime: {
            select: {
              id: true,
              title: true,
              title_orig: true,
              poster_url: true,
            },
          },
        },
      }),
      this.prisma.userActivity.count({ where }),
    ]);

    return {
      activities: activities.map((a) => ({
        id: a.id,
        type: a.type,
        user: {
          id: a.user.id,
          name: a.user.name,
          avatar_url: a.user.avatar_url,
        },
        anime: a.anime
          ? {
              id: a.anime.id,
              title: a.anime.title,
              title_orig: a.anime.title_orig,
              poster_url: a.anime.poster_url,
            }
          : null,
        metadata: a.metadata,
        created_at: a.created_at,
      })),
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }

  /**
   * Проверить доступ к активности пользователя
   */
  private async checkActivityAccess(
    userId: string,
    currentUserId?: string,
  ): Promise<void> {
    if (currentUserId === userId) {
      return;
    }

    const settings = await this.prisma.userSettings.findUnique({
      where: { user_id: userId },
      select: { activity_visibility: true },
    });

    if (!settings) {
      throw new NotFoundException('Настройки пользователя не найдены');
    }

    const visibility = settings.activity_visibility;

    if (visibility === Visibility.PUBLIC) {
      return;
    }

    if (!currentUserId) {
      throw new ForbiddenException('Активность этого пользователя приватная');
    }

    if (visibility === Visibility.FOLLOWERS_ONLY) {
      const isFollower = await this.prisma.userFollow.findUnique({
        where: {
          follower_id_following_id: {
            follower_id: currentUserId,
            following_id: userId,
          },
        },
      });

      if (!isFollower) {
        throw new ForbiddenException(
          'Активность доступна только для подписчиков',
        );
      }
    }

    if (visibility === Visibility.PRIVATE) {
      throw new ForbiddenException('Активность этого пользователя приватная');
    }
  }
}
