import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InteractionType, Visibility } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { WebSocketService } from '../websocket/websocket.service';
import {
  ProfileStatsResponseDto,
  PublicProfileResponseDto,
} from './dto/public-profile-response.dto';

@Injectable()
export class ProfilesService {
  constructor(
    private prisma: PrismaService,
    private webSocketService: WebSocketService,
  ) {}

  /**
   * Получить публичный профиль пользователя
   */
  async getPublicProfile(
    userId: string,
    currentUserId?: string,
  ): Promise<PublicProfileResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        avatar_url: true,
        created_at: true,
        settings: { select: { show_online_status: true } },
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const [followersCount, followingCount] = await Promise.all([
      this.prisma.userFollow.count({
        where: { following_id: userId },
      }),
      this.prisma.userFollow.count({
        where: { follower_id: userId },
      }),
    ]);

    let isFollowing: boolean | null = null;
    let isFollowedBy: boolean | null = null;
    let isBlocked: boolean | null = null;

    if (currentUserId && currentUserId !== userId) {
      const [followStatus, followBackStatus, blockStatus] = await Promise.all([
        this.prisma.userFollow.findUnique({
          where: {
            follower_id_following_id: {
              follower_id: currentUserId,
              following_id: userId,
            },
          },
        }),
        this.prisma.userFollow.findUnique({
          where: {
            follower_id_following_id: {
              follower_id: userId,
              following_id: currentUserId,
            },
          },
        }),
        this.prisma.userBlock.findFirst({
          where: {
            OR: [
              { blocker_id: currentUserId, blocked_id: userId },
              { blocker_id: userId, blocked_id: currentUserId },
            ],
          },
        }),
      ]);

      isFollowing = !!followStatus;
      isFollowedBy = !!followBackStatus;
      isBlocked = !!blockStatus;
    }

    const showOnline = user.settings?.show_online_status ?? true;
    const isOnline = showOnline
      ? await this.webSocketService.isUserOnline(userId)
      : null;

    return {
      id: user.id,
      name: user.name,
      avatar_url: user.avatar_url,
      created_at: user.created_at,
      followers_count: followersCount,
      following_count: followingCount,
      is_following: isFollowing,
      is_followed_by: isFollowedBy,
      is_blocked: isBlocked,
      is_online: isOnline,
    };
  }

  /**
   * Получить статистику профиля пользователя
   */
  async getProfileStats(
    userId: string,
    currentUserId?: string,
  ): Promise<ProfileStatsResponseDto> {
    await this.checkListsAccess(userId, currentUserId);
    const listCounts = await this.prisma.userAnimeList.groupBy({
      by: ['list_type'],
      where: { user_id: userId },
      _count: true,
    });

    const countsMap = new Map<InteractionType, number>();
    listCounts.forEach((item) => {
      countsMap.set(item.list_type, item._count);
    });

    const uniqueAnime = await this.prisma.userAnimeList.findMany({
      where: { user_id: userId },
      distinct: ['anime_id'],
      select: { anime_id: true },
    });
    const totalAnime = uniqueAnime.length;

    const avgRating = await this.prisma.userAnimeRating.aggregate({
      where: { user_id: userId },
      _avg: { rating: true },
    });

    const [reviewsCount, commentsCount] = await Promise.all([
      this.prisma.review.count({
        where: { user_id: userId, status: 'APPROVED' },
      }),
      this.prisma.comment.count({
        where: { user_id: userId },
      }),
    ]);

    return {
      total_anime: totalAnime,
      watched_count: countsMap.get(InteractionType.WATCHED) ?? 0,
      watching_count: countsMap.get(InteractionType.WATCHING) ?? 0,
      planned_count: countsMap.get(InteractionType.PLANNED) ?? 0,
      dropped_count: countsMap.get(InteractionType.DROPPED) ?? 0,
      favorite_count: countsMap.get(InteractionType.FAVORITE) ?? 0,
      recommended_count: countsMap.get(InteractionType.RECOMMENDED) ?? 0,
      disliked_count: countsMap.get(InteractionType.DISLIKED) ?? 0,
      average_rating: avgRating._avg.rating
        ? Math.round(avgRating._avg.rating * 10) / 10
        : null,
      reviews_count: reviewsCount,
      comments_count: commentsCount,
    };
  }

  /**
   * Проверить доступ к спискам пользователя
   */
  private async checkListsAccess(
    userId: string,
    currentUserId?: string,
  ): Promise<void> {
    if (currentUserId === userId) {
      return;
    }

    const settings = await this.prisma.userSettings.findUnique({
      where: { user_id: userId },
      select: { lists_visibility: true },
    });

    const visibility = settings?.lists_visibility ?? Visibility.PUBLIC;

    if (visibility === Visibility.PUBLIC) {
      return;
    }

    if (!currentUserId) {
      throw new ForbiddenException('Списки этого пользователя приватные');
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
          'Списки доступны только для подписчиков',
        );
      }
    }

    if (visibility === Visibility.PRIVATE) {
      throw new ForbiddenException('Списки этого пользователя приватные');
    }
  }
}
