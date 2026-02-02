import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ModerateReviewDto } from './dto/moderate-review.dto';
import { GetReviewsDto } from './dto/get-reviews.dto';
import { LikeReviewDto } from './dto/like-review.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { PaginatedReviewsResponseDto } from './dto/paginated-reviews-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать рецензию' })
  @ApiResponse({
    status: 201,
    description: 'Рецензия создана',
    type: ReviewResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Невалидные данные или рецензия уже существует' })
  @ApiResponse({ status: 404, description: 'Аниме не найдено' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateReviewDto,
  ): Promise<ReviewResponseDto> {
    return this.reviewsService.create(userId, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить рецензию (только REJECTED)' })
  @ApiParam({ name: 'id', description: 'ID рецензии' })
  @ApiResponse({
    status: 200,
    description: 'Рецензия обновлена',
    type: ReviewResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Редактировать можно только отклонённые рецензии' })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  @ApiResponse({ status: 404, description: 'Рецензия не найдена' })
  async update(
    @CurrentUser('id') userId: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReviewDto,
  ): Promise<ReviewResponseDto> {
    return this.reviewsService.update(userId, id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удалить рецензию' })
  @ApiParam({ name: 'id', description: 'ID рецензии' })
  @ApiResponse({ status: 200, description: 'Рецензия удалена' })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  @ApiResponse({ status: 404, description: 'Рецензия не найдена' })
  async delete(
    @CurrentUser('id') userId: string,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    return this.reviewsService.delete(userId, id);
  }

  @Get('anime/:animeId')
  @ApiOperation({ summary: 'Получить рецензии на аниме' })
  @ApiParam({ name: 'animeId', description: 'ID аниме' })
  @ApiResponse({
    status: 200,
    description: 'Список рецензий',
    type: PaginatedReviewsResponseDto,
  })
  async findByAnime(
    @Param('animeId', ParseIntPipe) animeId: number,
    @Query() dto: GetReviewsDto,
    @CurrentUser('id') currentUserId?: string,
  ): Promise<PaginatedReviewsResponseDto> {
    return this.reviewsService.findByAnime(animeId, dto, currentUserId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Получить рецензии пользователя' })
  @ApiParam({ name: 'userId', description: 'ID пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Список рецензий',
    type: PaginatedReviewsResponseDto,
  })
  async findByUser(
    @Param('userId') userId: string,
    @Query() dto: GetReviewsDto,
  ): Promise<PaginatedReviewsResponseDto> {
    return this.reviewsService.findByUser(userId, dto);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить свои рецензии (все статусы)' })
  @ApiResponse({
    status: 200,
    description: 'Список рецензий',
    type: PaginatedReviewsResponseDto,
  })
  async findMyReviews(
    @CurrentUser('id') userId: string,
    @Query() dto: GetReviewsDto,
  ): Promise<PaginatedReviewsResponseDto> {
    return this.reviewsService.findMyReviews(userId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить одну рецензию' })
  @ApiParam({ name: 'id', description: 'ID рецензии' })
  @ApiResponse({
    status: 200,
    description: 'Рецензия',
    type: ReviewResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Рецензия не найдена' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') currentUserId?: string,
  ): Promise<ReviewResponseDto> {
    return this.reviewsService.findOne(id, currentUserId);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Лайк/дизлайк рецензии' })
  @ApiParam({ name: 'id', description: 'ID рецензии' })
  @ApiResponse({ status: 201, description: 'Реакция добавлена/обновлена' })
  @ApiResponse({ status: 400, description: 'Нельзя лайкать свои рецензии' })
  @ApiResponse({ status: 404, description: 'Рецензия не найдена' })
  async likeReview(
    @CurrentUser('id') userId: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: LikeReviewDto,
  ): Promise<{ message: string }> {
    return this.reviewsService.likeReview(userId, id, dto);
  }

  @Delete(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Убрать реакцию' })
  @ApiParam({ name: 'id', description: 'ID рецензии' })
  @ApiResponse({ status: 200, description: 'Реакция удалена' })
  @ApiResponse({ status: 404, description: 'Рецензия или реакция не найдена' })
  async removeLike(
    @CurrentUser('id') userId: string,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    return this.reviewsService.removeLike(userId, id);
  }

  @Get('moderation/pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Очередь модерации (только ADMIN/MODERATOR)' })
  @ApiResponse({
    status: 200,
    description: 'Список рецензий на модерации',
    type: PaginatedReviewsResponseDto,
  })
  async findPendingReviews(
    @Query() dto: GetReviewsDto,
  ): Promise<PaginatedReviewsResponseDto> {
    return this.reviewsService.findPendingReviews(dto);
  }

  @Patch(':id/moderate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Одобрить/отклонить рецензию (только ADMIN/MODERATOR)' })
  @ApiParam({ name: 'id', description: 'ID рецензии' })
  @ApiResponse({
    status: 200,
    description: 'Рецензия обработана',
    type: ReviewResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Рецензия уже обработана или отсутствует причина отклонения' })
  @ApiResponse({ status: 404, description: 'Рецензия не найдена' })
  async moderate(
    @CurrentUser('id') moderatorId: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ModerateReviewDto,
  ): Promise<ReviewResponseDto> {
    return this.reviewsService.moderate(moderatorId, id, dto);
  }
}
