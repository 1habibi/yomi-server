import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CommentResponseDto } from './dto/comment-response.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentSortBy, GetCommentsDto } from './dto/get-comments.dto';
import { LikeCommentDto } from './dto/like-comment.dto';
import { PaginatedCommentsResponseDto } from './dto/paginated-comments-response.dto';
import { ReportCommentDto } from './dto/report-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async create(
    animeId: number,
    userId: string,
    dto: CreateCommentDto,
  ): Promise<CommentResponseDto> {
    const anime = await this.prisma.anime.findUnique({
      where: { id: animeId },
    });

    if (!anime) {
      throw new NotFoundException(`Аниме с ID ${animeId} не найдено`);
    }

    if (dto.parent_id) {
      const parentComment = await this.prisma.comment.findUnique({
        where: { id: dto.parent_id },
      });

      if (!parentComment) {
        throw new NotFoundException(`Родительский комментарий с ID ${dto.parent_id} не найден`);
      }

      if (parentComment.anime_id !== animeId) {
        throw new BadRequestException('Родительский комментарий не принадлежит этому аниме');
      }

      const depth = await this.getCommentDepth(dto.parent_id);
      if (depth >= 5) {
        throw new BadRequestException('Достигнута максимальная глубина вложенности комментариев');
      }
    }

    const comment = await this.prisma.comment.create({
      data: {
        content: dto.content,
        anime_id: animeId,
        user_id: userId,
        parent_id: dto.parent_id || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar_url: true,
          },
        },
      },
    });

    if (dto.parent_id) {
      const parentComment = await this.prisma.comment.findUnique({
        where: { id: dto.parent_id },
        select: { user_id: true },
      });

      if (parentComment && parentComment.user_id !== userId) {
        await this.prisma.notification.create({
          data: {
            type: 'COMMENT_REPLY',
            user_id: parentComment.user_id,
            actor_id: userId,
            comment_id: comment.id,
            anime_id: animeId,
          },
        });
      }
    }

    return this.formatCommentResponse(comment, userId);
  }

  async findAllByAnime(
    animeId: number,
    dto: GetCommentsDto,
    currentUserId?: string,
  ): Promise<PaginatedCommentsResponseDto> {
    const { page = 1, limit = 20, sort_by = CommentSortBy.NEWEST } = dto;

    if (page < 1) {
      throw new BadRequestException('Номер страницы должен быть больше 0');
    }

    const skip = (page - 1) * limit;

    const where: Prisma.CommentWhereInput = {
      anime_id: animeId,
      parent_id: null,
    };

    const orderBy = this.getOrderBy(sort_by);

    let comments: any[];
    if (sort_by === CommentSortBy.POPULAR) {
      const allComments = await this.prisma.comment.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar_url: true,
            },
          },
          likes: true,
          _count: {
            select: {
              replies: true,
            },
          },
        },
      });

      comments = allComments
        .map((comment) => ({
          ...comment,
          popularityScore: this.calculatePopularityScore(comment.likes),
        }))
        .sort((a, b) => b.popularityScore - a.popularityScore)
        .slice(skip, skip + limit);
    } else {
      comments = await this.prisma.comment.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar_url: true,
            },
          },
          likes: true,
          _count: {
            select: {
              replies: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      });
    }

    const total = await this.prisma.comment.count({
      where: { anime_id: animeId },
    });

    const formattedComments = await Promise.all(
      comments.map(async (comment) => {
        const formatted = this.formatCommentResponse(comment, currentUserId);
        formatted.replies = await this.loadReplies(comment.id, currentUserId);
        return formatted;
      }),
    );

    return {
      data: formattedComments,
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

  async findOne(id: number, currentUserId?: string): Promise<CommentResponseDto> {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar_url: true,
          },
        },
        likes: true,
        _count: {
          select: {
            replies: true,
          },
        },
      },
    });

    if (!comment) {
      throw new NotFoundException(`Комментарий с ID ${id} не найден`);
    }

    const formatted = this.formatCommentResponse(comment, currentUserId);
    formatted.replies = await this.loadReplies(id, currentUserId);
    return formatted;
  }

  async update(
    id: number,
    userId: string,
    dto: UpdateCommentDto,
  ): Promise<CommentResponseDto> {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException(`Комментарий с ID ${id} не найден`);
    }

    if (comment.user_id !== userId) {
      throw new ForbiddenException('Вы можете редактировать только свои комментарии');
    }

    const updated = await this.prisma.comment.update({
      where: { id },
      data: {
        content: dto.content,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar_url: true,
          },
        },
        likes: true,
        _count: {
          select: {
            replies: true,
          },
        },
      },
    });

    return this.formatCommentResponse(updated, userId);
  }

  async remove(id: number, userId: string, userRole: string): Promise<void> {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException(`Комментарий с ID ${id} не найден`);
    }

    const isOwner = comment.user_id === userId;
    const isModerator = userRole === 'MODERATOR' || userRole === 'ADMIN';

    if (!isOwner && !isModerator) {
      throw new ForbiddenException('Вы можете удалять только свои комментарии');
    }

    await this.prisma.comment.delete({
      where: { id },
    });
  }

  async likeComment(
    commentId: number,
    userId: string,
    dto: LikeCommentDto,
  ): Promise<{ likes_count: number; dislikes_count: number; is_liked: boolean | null }> {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException(`Комментарий с ID ${commentId} не найден`);
    }

    const existingLike = await this.prisma.commentLike.findUnique({
      where: {
        comment_id_user_id: {
          comment_id: commentId,
          user_id: userId,
        },
      },
    });

    if (existingLike) {
      if (existingLike.is_like === dto.is_like) {
        await this.prisma.commentLike.delete({
          where: {
            comment_id_user_id: {
              comment_id: commentId,
              user_id: userId,
            },
          },
        });
      } else {
        await this.prisma.commentLike.update({
          where: {
            comment_id_user_id: {
              comment_id: commentId,
              user_id: userId,
            },
          },
          data: {
            is_like: dto.is_like,
          },
        });
      }
    } else {
      await this.prisma.commentLike.create({
        data: {
          comment_id: commentId,
          user_id: userId,
          is_like: dto.is_like,
        },
      });

      if (comment.user_id !== userId && dto.is_like) {
        await this.prisma.notification.create({
          data: {
            type: 'COMMENT_LIKE',
            user_id: comment.user_id,
            actor_id: userId,
            comment_id: commentId,
            anime_id: comment.anime_id,
          },
        });
      }
    }

    return this.getCommentLikeStats(commentId, userId);
  }

  async removeLike(commentId: number, userId: string): Promise<void> {
    const like = await this.prisma.commentLike.findUnique({
      where: {
        comment_id_user_id: {
          comment_id: commentId,
          user_id: userId,
        },
      },
    });

    if (!like) {
      throw new NotFoundException('Вы еще не оценили этот комментарий');
    }

    await this.prisma.commentLike.delete({
      where: {
        comment_id_user_id: {
          comment_id: commentId,
          user_id: userId,
        },
      },
    });
  }

  async reportComment(
    commentId: number,
    userId: string,
    dto: ReportCommentDto,
  ): Promise<{ message: string }> {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException(`Комментарий с ID ${commentId} не найден`);
    }

    const existingReport = await this.prisma.commentReport.findUnique({
      where: {
        comment_id_user_id: {
          comment_id: commentId,
          user_id: userId,
        },
      },
    });

    if (existingReport) {
      throw new BadRequestException('Вы уже подавали жалобу на этот комментарий');
    }

    await this.prisma.commentReport.create({
      data: {
        comment_id: commentId,
        user_id: userId,
        reason: dto.reason,
        description: dto.description,
      },
    });

    return { message: 'Жалоба успешно отправлена' };
  }

  private async getCommentDepth(commentId: number, depth: number = 0): Promise<number> {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      select: { parent_id: true },
    });

    if (!comment || !comment.parent_id) {
      return depth;
    }

    return this.getCommentDepth(comment.parent_id, depth + 1);
  }

  private async loadReplies(
    parentId: number,
    currentUserId?: string,
    maxDepth: number = 5,
    currentDepth: number = 0,
  ): Promise<CommentResponseDto[]> {
    if (currentDepth >= maxDepth) {
      return [];
    }

    const replies = await this.prisma.comment.findMany({
      where: { parent_id: parentId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar_url: true,
          },
        },
        likes: true,
        _count: {
          select: {
            replies: true,
          },
        },
      },
      orderBy: { created_at: 'asc' },
    });

    return Promise.all(
      replies.map(async (reply) => {
        const formatted = this.formatCommentResponse(reply, currentUserId);
        formatted.replies = await this.loadReplies(
          reply.id,
          currentUserId,
          maxDepth,
          currentDepth + 1,
        );
        return formatted;
      }),
    );
  }

  private formatCommentResponse(comment: any, currentUserId?: string): CommentResponseDto {
    const likes = comment.likes || [];
    const likesCount = likes.filter((l) => l.is_like === true).length;
    const dislikesCount = likes.filter((l) => l.is_like === false).length;

    let isLikedByCurrentUser: boolean | null = null;
    if (currentUserId) {
      const userLike = likes.find((l) => l.user_id === currentUserId);
      if (userLike) {
        isLikedByCurrentUser = userLike.is_like;
      }
    }

    return {
      id: comment.id,
      content: comment.content,
      anime_id: comment.anime_id,
      parent_id: comment.parent_id,
      user: {
        id: comment.user.id,
        name: comment.user.name,
        avatar_url: comment.user.avatar_url,
      },
      likes_count: likesCount,
      dislikes_count: dislikesCount,
      is_liked_by_current_user: isLikedByCurrentUser,
      replies_count: comment._count?.replies || 0,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
    };
  }

  private async getCommentLikeStats(
    commentId: number,
    userId?: string,
  ): Promise<{ likes_count: number; dislikes_count: number; is_liked: boolean | null }> {
    const likes = await this.prisma.commentLike.findMany({
      where: { comment_id: commentId },
    });

    const likesCount = likes.filter((l) => l.is_like === true).length;
    const dislikesCount = likes.filter((l) => l.is_like === false).length;

    let isLiked: boolean | null = null;
    if (userId) {
      const userLike = likes.find((l) => l.user_id === userId);
      if (userLike) {
        isLiked = userLike.is_like;
      }
    }

    return {
      likes_count: likesCount,
      dislikes_count: dislikesCount,
      is_liked: isLiked,
    };
  }

  private calculatePopularityScore(likes: any[]): number {
    const likesCount = likes.filter((l) => l.is_like === true).length;
    const dislikesCount = likes.filter((l) => l.is_like === false).length;
    return likesCount - dislikesCount;
  }

  private getOrderBy(sortBy: CommentSortBy): Prisma.CommentOrderByWithRelationInput {
    switch (sortBy) {
      case CommentSortBy.NEWEST:
        return { created_at: 'desc' };
      case CommentSortBy.OLDEST:
        return { created_at: 'asc' };
      default:
        return { created_at: 'desc' };
    }
  }
}
