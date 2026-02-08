import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  FollowCheckResponseDto,
  FollowResponseDto,
  PaginatedFollowsResponseDto,
} from './dto/follow-response.dto';
import { GetFollowsDto } from './dto/get-follows.dto';

@Injectable()
export class FollowsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Подписаться на пользователя
   */
  async follow(
    followerId: string,
    followingId: string,
  ): Promise<{ message: string }> {
    if (followerId === followingId) {
      throw new BadRequestException('Нельзя подписаться на самого себя');
    }

    const userExists = await this.prisma.user.findUnique({
      where: { id: followingId },
    });
    if (!userExists) {
      throw new NotFoundException('Пользователь не найден');
    }

    const isBlocked = await this.prisma.userBlock.findFirst({
      where: {
        OR: [
          { blocker_id: followerId, blocked_id: followingId },
          { blocker_id: followingId, blocked_id: followerId },
        ],
      },
    });
    if (isBlocked) {
      throw new BadRequestException('Действие невозможно из-за блокировки');
    }

    const existingFollow = await this.prisma.userFollow.findUnique({
      where: {
        follower_id_following_id: {
          follower_id: followerId,
          following_id: followingId,
        },
      },
    });

    if (existingFollow) {
      throw new BadRequestException('Вы уже подписаны на этого пользователя');
    }

    await this.prisma.userFollow.create({
      data: {
        follower_id: followerId,
        following_id: followingId,
      },
    });

    return { message: 'Подписка оформлена' };
  }

  /**
   * Отписаться от пользователя
   */
  async unfollow(
    followerId: string,
    followingId: string,
  ): Promise<{ message: string }> {
    const follow = await this.prisma.userFollow.findUnique({
      where: {
        follower_id_following_id: {
          follower_id: followerId,
          following_id: followingId,
        },
      },
    });

    if (!follow) {
      throw new NotFoundException('Подписка не найдена');
    }

    await this.prisma.userFollow.delete({
      where: { id: follow.id },
    });

    return { message: 'Подписка отменена' };
  }

  /**
   * Получить список подписчиков пользователя
   */
  async getFollowers(
    userId: string,
    dto: GetFollowsDto,
  ): Promise<PaginatedFollowsResponseDto> {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const skip = (page - 1) * limit;

    const [follows, total] = await Promise.all([
      this.prisma.userFollow.findMany({
        where: { following_id: userId },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          follower: {
            select: { id: true, name: true, avatar_url: true },
          },
        },
      }),
      this.prisma.userFollow.count({
        where: { following_id: userId },
      }),
    ]);

    return {
      follows: follows.map((f) => ({
        id: f.id,
        user: {
          id: f.follower.id,
          name: f.follower.name,
          avatar_url: f.follower.avatar_url,
        },
        created_at: f.created_at,
      })),
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }

  /**
   * Получить список подписок пользователя
   */
  async getFollowing(
    userId: string,
    dto: GetFollowsDto,
  ): Promise<PaginatedFollowsResponseDto> {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const skip = (page - 1) * limit;

    const [follows, total] = await Promise.all([
      this.prisma.userFollow.findMany({
        where: { follower_id: userId },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          following: {
            select: { id: true, name: true, avatar_url: true },
          },
        },
      }),
      this.prisma.userFollow.count({
        where: { follower_id: userId },
      }),
    ]);

    return {
      follows: follows.map((f) => ({
        id: f.id,
        user: {
          id: f.following.id,
          name: f.following.name,
          avatar_url: f.following.avatar_url,
        },
        created_at: f.created_at,
      })),
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }

  /**
   * Проверить статус подписки между пользователями
   */
  async checkFollowStatus(
    currentUserId: string,
    targetUserId: string,
  ): Promise<FollowCheckResponseDto> {
    const [isFollowing, isFollowedBy] = await Promise.all([
      this.prisma.userFollow.findUnique({
        where: {
          follower_id_following_id: {
            follower_id: currentUserId,
            following_id: targetUserId,
          },
        },
      }),
      this.prisma.userFollow.findUnique({
        where: {
          follower_id_following_id: {
            follower_id: targetUserId,
            following_id: currentUserId,
          },
        },
      }),
    ]);

    return {
      is_following: !!isFollowing,
      is_followed_by: !!isFollowedBy,
    };
  }
}
