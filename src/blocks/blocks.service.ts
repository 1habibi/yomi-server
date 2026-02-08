import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginatedBlocksResponseDto } from './dto/block-response.dto';
import { GetBlocksDto } from './dto/get-blocks.dto';

@Injectable()
export class BlocksService {
  constructor(private prisma: PrismaService) {}

  /**
   * Заблокировать пользователя
   */
  async blockUser(
    blockerId: string,
    blockedId: string,
  ): Promise<{ message: string }> {
    if (blockerId === blockedId) {
      throw new BadRequestException('Нельзя заблокировать самого себя');
    }

    const userExists = await this.prisma.user.findUnique({
      where: { id: blockedId },
    });
    if (!userExists) {
      throw new NotFoundException('Пользователь не найден');
    }

    const existingBlock = await this.prisma.userBlock.findUnique({
      where: {
        blocker_id_blocked_id: {
          blocker_id: blockerId,
          blocked_id: blockedId,
        },
      },
    });

    if (existingBlock) {
      throw new BadRequestException('Пользователь уже заблокирован');
    }

    await this.prisma.$transaction([
      this.prisma.userFollow.deleteMany({
        where: {
          OR: [
            { follower_id: blockerId, following_id: blockedId },
            { follower_id: blockedId, following_id: blockerId },
          ],
        },
      }),
      this.prisma.userBlock.create({
        data: {
          blocker_id: blockerId,
          blocked_id: blockedId,
        },
      }),
    ]);

    return { message: 'Пользователь заблокирован' };
  }

  /**
   * Разблокировать пользователя
   */
  async unblockUser(
    blockerId: string,
    blockedId: string,
  ): Promise<{ message: string }> {
    const block = await this.prisma.userBlock.findUnique({
      where: {
        blocker_id_blocked_id: {
          blocker_id: blockerId,
          blocked_id: blockedId,
        },
      },
    });

    if (!block) {
      throw new NotFoundException('Блокировка не найдена');
    }

    await this.prisma.userBlock.delete({
      where: { id: block.id },
    });

    return { message: 'Пользователь разблокирован' };
  }

  /**
   * Получить список заблокированных пользователей
   */
  async getBlockedUsers(
    blockerId: string,
    dto: GetBlocksDto,
  ): Promise<PaginatedBlocksResponseDto> {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const skip = (page - 1) * limit;

    const [blocks, total] = await Promise.all([
      this.prisma.userBlock.findMany({
        where: { blocker_id: blockerId },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          blocked: {
            select: { id: true, name: true, avatar_url: true },
          },
        },
      }),
      this.prisma.userBlock.count({
        where: { blocker_id: blockerId },
      }),
    ]);

    return {
      blocks: blocks.map((b) => ({
        id: b.id,
        user: {
          id: b.blocked.id,
          name: b.blocked.name,
          avatar_url: b.blocked.avatar_url,
        },
        created_at: b.created_at,
      })),
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }

  /**
   * Проверить, заблокирован ли пользователь
   */
  async isBlocked(blockerId: string, blockedId: string): Promise<boolean> {
    const block = await this.prisma.userBlock.findUnique({
      where: {
        blocker_id_blocked_id: {
          blocker_id: blockerId,
          blocked_id: blockedId,
        },
      },
    });

    return !!block;
  }
}
