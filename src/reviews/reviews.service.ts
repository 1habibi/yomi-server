import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Review, ReviewLike, ReviewStatus } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { GetReviewsDto } from './dto/get-reviews.dto';
import { LikeReviewDto } from './dto/like-review.dto';
import { ModerateReviewDto } from './dto/moderate-review.dto';
import { PaginatedReviewsResponseDto } from './dto/paginated-reviews-response.dto';
import {
  ReviewAnimeDto,
  ReviewResponseDto,
  ReviewUserDto,
} from './dto/review-response.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  private readonly REVIEW_INCLUDE = {
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
  } as const;

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async create(
    userId: string,
    dto: CreateReviewDto,
  ): Promise<ReviewResponseDto> {
    const anime = await this.prisma.anime.findUnique({
      where: { id: dto.anime_id },
    });
    if (!anime) {
      throw new NotFoundException('Аниме не найдено');
    }

    const existingReview = await this.prisma.review.findUnique({
      where: {
        user_id_anime_id: {
          user_id: userId,
          anime_id: dto.anime_id,
        },
      },
    });

    if (existingReview) {
      throw new BadRequestException('Вы уже написали рецензию на это аниме');
    }

    const review = await this.prisma.review.create({
      data: {
        user_id: userId,
        anime_id: dto.anime_id,
        content: dto.content,
        overall_rating: dto.overall_rating,
        story_rating: dto.story_rating,
        animation_rating: dto.animation_rating,
        music_rating: dto.music_rating,
        characters_rating: dto.characters_rating,
        voice_acting_rating: dto.voice_acting_rating,
        has_spoilers: dto.has_spoilers ?? false,
        status: ReviewStatus.PENDING,
      },
      include: this.REVIEW_INCLUDE,
    });

    return this.mapToResponseDto(review, null);
  }

  async update(
    userId: string,
    reviewId: number,
    dto: UpdateReviewDto,
  ): Promise<ReviewResponseDto> {
    const review = await this.findReviewOrThrow(reviewId);
    this.validateReviewOwnership(review, userId, 'редактировать');

    if (review.status !== ReviewStatus.REJECTED) {
      throw new BadRequestException(
        'Редактировать можно только отклонённые рецензии',
      );
    }

    const updatedReview = await this.prisma.review.update({
      where: { id: reviewId },
      data: {
        ...dto,
        status: ReviewStatus.PENDING,
        rejection_reason: null,
        moderated_by: null,
        moderated_at: null,
      },
      include: this.REVIEW_INCLUDE,
    });

    return this.mapToResponseDto(updatedReview, null);
  }

  async delete(
    userId: string,
    reviewId: number,
  ): Promise<{ message: string }> {
    const review = await this.findReviewOrThrow(reviewId);
    this.validateReviewOwnership(review, userId, 'удалять');

    await this.prisma.review.delete({
      where: { id: reviewId },
    });

    return { message: 'Рецензия успешно удалена' };
  }

  async findByAnime(
    animeId: number,
    dto: GetReviewsDto,
    currentUserId?: string,
  ): Promise<PaginatedReviewsResponseDto> {
    const { page, limit, skip } = this.calculatePagination(dto);
    const orderBy = this.getOrderBy(dto.sort_by);

    const where: Prisma.ReviewWhereInput = {
      anime_id: animeId,
      OR: [
        { status: ReviewStatus.APPROVED },
        ...(currentUserId ? [{ user_id: currentUserId }] : []),
      ],
    };

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: this.getReviewIncludeWithLikes(currentUserId),
      }),
      this.prisma.review.count({ where }),
    ]);

    const reviewsWithReactions = reviews.map((review) =>
      this.mapToResponseDto(
        review,
        currentUserId ? (review.likes as any)?.[0]?.is_like ?? null : null,
      ),
    );

    return this.buildPaginatedResponse(reviewsWithReactions, total, page, limit);
  }

  async findByUser(
    userId: string,
    dto: GetReviewsDto,
  ): Promise<PaginatedReviewsResponseDto> {
    const { page, limit, skip } = this.calculatePagination(dto);

    const where: Prisma.ReviewWhereInput = {
      user_id: userId,
      status: ReviewStatus.APPROVED,
    };

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: this.REVIEW_INCLUDE,
      }),
      this.prisma.review.count({ where }),
    ]);

    const reviewDtos = reviews.map((review) =>
      this.mapToResponseDto(review, null),
    );

    return this.buildPaginatedResponse(reviewDtos, total, page, limit);
  }

  async findMyReviews(
    userId: string,
    dto: GetReviewsDto,
  ): Promise<PaginatedReviewsResponseDto> {
    const { page, limit, skip } = this.calculatePagination(dto);

    const where: Prisma.ReviewWhereInput = {
      user_id: userId,
    };

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: this.REVIEW_INCLUDE,
      }),
      this.prisma.review.count({ where }),
    ]);

    const reviewDtos = reviews.map((review) =>
      this.mapToResponseDto(review, null),
    );

    return this.buildPaginatedResponse(reviewDtos, total, page, limit);
  }

  async findOne(
    reviewId: number,
    currentUserId?: string,
  ): Promise<ReviewResponseDto> {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: this.getReviewIncludeWithLikes(currentUserId),
    });

    if (!review) {
      throw new NotFoundException('Рецензия не найдена');
    }

    const userReaction = currentUserId
      ? (review.likes as any)?.[0]?.is_like ?? null
      : null;

    return this.mapToResponseDto(review, userReaction);
  }

  async moderate(
    moderatorId: string,
    reviewId: number,
    dto: ModerateReviewDto,
  ): Promise<ReviewResponseDto> {
    const review = await this.findReviewOrThrow(reviewId);

    if (review.status !== ReviewStatus.PENDING) {
      throw new BadRequestException('Рецензия уже обработана модератором');
    }

    if (dto.status === 'REJECTED' && !dto.rejection_reason) {
      throw new BadRequestException('Необходимо указать причину отклонения');
    }

    const updatedReview = await this.prisma.review.update({
      where: { id: reviewId },
      data: {
        status: dto.status as ReviewStatus,
        rejection_reason: dto.rejection_reason,
        moderated_by: moderatorId,
        moderated_at: new Date(),
      },
      include: this.REVIEW_INCLUDE,
    });

    if (dto.status === 'APPROVED') {
      await this.notificationsService.createReviewApprovedNotification(
        reviewId,
        review.user_id,
        moderatorId,
      );
    } else if (dto.status === 'REJECTED') {
      await this.notificationsService.createReviewRejectedNotification(
        reviewId,
        review.user_id,
        moderatorId,
      );
    }

    return this.mapToResponseDto(updatedReview, null);
  }

  async findPendingReviews(
    dto: GetReviewsDto,
  ): Promise<PaginatedReviewsResponseDto> {
    const { page, limit, skip } = this.calculatePagination(dto);

    const where: Prisma.ReviewWhereInput = {
      status: ReviewStatus.PENDING,
    };

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'asc' },
        include: this.REVIEW_INCLUDE,
      }),
      this.prisma.review.count({ where }),
    ]);

    const reviewDtos = reviews.map((review) =>
      this.mapToResponseDto(review, null),
    );

    return this.buildPaginatedResponse(reviewDtos, total, page, limit);
  }

  async likeReview(
    userId: string,
    reviewId: number,
    dto: LikeReviewDto,
  ): Promise<{ message: string }> {
    const review = await this.findReviewOrThrow(reviewId);
    this.validateNotOwnReview(review, userId);

    const existingLike = await this.findExistingLike(reviewId, userId);

    if (!existingLike) {
      await this.createNewLike(reviewId, userId, dto, review);
    } else if (existingLike.is_like === dto.is_like) {
      await this.removeExistingLike(
        existingLike.id,
        reviewId,
        dto.is_like,
        review,
      );
    } else {
      await this.toggleExistingLike(existingLike.id, reviewId, dto.is_like);
    }

    return { message: 'Реакция обновлена' };
  }

  async removeLike(
    userId: string,
    reviewId: number,
  ): Promise<{ message: string }> {
    const review = await this.findReviewOrThrow(reviewId);
    const existingLike = await this.findExistingLike(reviewId, userId);

    if (!existingLike) {
      throw new NotFoundException('Реакция не найдена');
    }

    await this.removeExistingLike(
      existingLike.id,
      reviewId,
      existingLike.is_like,
      review,
    );

    return { message: 'Реакция удалена' };
  }

  private getReviewIncludeWithLikes(userId?: string) {
    return {
      ...this.REVIEW_INCLUDE,
      likes: userId
        ? { where: { user_id: userId }, select: { is_like: true } }
        : false,
    };
  }

  private calculatePagination(dto: GetReviewsDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const skip = (page - 1) * limit;
    return { page, limit, skip };
  }

  private getOrderBy(
    sortBy: GetReviewsDto['sort_by'],
  ): Prisma.ReviewOrderByWithRelationInput[] {
    switch (sortBy) {
      case 'newest':
        return [{ created_at: 'desc' }];
      case 'helpful':
        return [{ likes_count: 'desc' }, { created_at: 'desc' }];
      case 'rating':
        return [{ overall_rating: 'desc' }, { created_at: 'desc' }];
      default:
        return [{ created_at: 'desc' }];
    }
  }

  private buildPaginatedResponse(
    reviews: ReviewResponseDto[],
    total: number,
    page: number,
    limit: number,
  ): PaginatedReviewsResponseDto {
    return {
      reviews,
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }

  private async findReviewOrThrow(reviewId: number): Promise<Review> {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });
    if (!review) {
      throw new NotFoundException('Рецензия не найдена');
    }
    return review;
  }

  private validateReviewOwnership(
    review: Review,
    userId: string,
    action: string,
  ) {
    if (review.user_id !== userId) {
      throw new ForbiddenException(`Вы можете ${action} только свои рецензии`);
    }
  }

  private validateNotOwnReview(review: Review, userId: string) {
    if (review.user_id === userId) {
      throw new BadRequestException('Нельзя лайкать свои рецензии');
    }
  }

  private async findExistingLike(
    reviewId: number,
    userId: string,
  ): Promise<ReviewLike | null> {
    return this.prisma.reviewLike.findUnique({
      where: {
        review_id_user_id: {
          review_id: reviewId,
          user_id: userId,
        },
      },
    });
  }

  private async createNewLike(
    reviewId: number,
    userId: string,
    dto: LikeReviewDto,
    review: Review,
  ): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.reviewLike.create({
        data: {
          review_id: reviewId,
          user_id: userId,
          is_like: dto.is_like,
        },
      }),
      this.prisma.review.update({
        where: { id: reviewId },
        data: {
          likes_count: dto.is_like ? { increment: 1 } : review.likes_count,
          dislikes_count: !dto.is_like
            ? { increment: 1 }
            : review.dislikes_count,
        },
      }),
    ]);
  }

  private async removeExistingLike(
    likeId: number,
    reviewId: number,
    isLike: boolean,
    review: Review,
  ): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.reviewLike.delete({
        where: { id: likeId },
      }),
      this.prisma.review.update({
        where: { id: reviewId },
        data: {
          likes_count: isLike ? { decrement: 1 } : review.likes_count,
          dislikes_count: !isLike ? { decrement: 1 } : review.dislikes_count,
        },
      }),
    ]);
  }

  private async toggleExistingLike(
    likeId: number,
    reviewId: number,
    newIsLike: boolean,
  ): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.reviewLike.update({
        where: { id: likeId },
        data: { is_like: newIsLike },
      }),
      this.prisma.review.update({
        where: { id: reviewId },
        data: {
          likes_count: newIsLike ? { increment: 1 } : { decrement: 1 },
          dislikes_count: newIsLike ? { decrement: 1 } : { increment: 1 },
        },
      }),
    ]);
  }

  private mapToResponseDto(
    review: any,
    userReaction: boolean | null,
  ): ReviewResponseDto {
    return {
      id: review.id,
      user: {
        id: review.user.id,
        name: review.user.name,
        avatar_url: review.user.avatar_url,
      } as ReviewUserDto,
      anime: {
        id: review.anime.id,
        title: review.anime.title,
        title_orig: review.anime.title_orig,
        poster_url: review.anime.poster_url,
      } as ReviewAnimeDto,
      content: review.content,
      overall_rating: review.overall_rating,
      story_rating: review.story_rating,
      animation_rating: review.animation_rating,
      music_rating: review.music_rating,
      characters_rating: review.characters_rating,
      voice_acting_rating: review.voice_acting_rating,
      has_spoilers: review.has_spoilers,
      status: review.status,
      rejection_reason: review.rejection_reason,
      moderated_at: review.moderated_at,
      likes_count: review.likes_count,
      dislikes_count: review.dislikes_count,
      created_at: review.created_at,
      updated_at: review.updated_at,
      user_reaction: userReaction,
    };
  }
}
