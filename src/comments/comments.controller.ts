import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags, ApiBearerAuth, ApiExtraModels } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { CommentsService } from './comments.service';
import { CommentResponseDto } from './dto/comment-response.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { GetCommentsDto } from './dto/get-comments.dto';
import { LikeCommentDto } from './dto/like-comment.dto';
import { PaginatedCommentsResponseDto } from './dto/paginated-comments-response.dto';
import { ReportCommentDto } from './dto/report-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@ApiTags('Comments')
@ApiExtraModels(CommentResponseDto)
@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post('anime/:animeId/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Создать комментарий к аниме',
    description: 'Позволяет авторизованному пользователю оставить комментарий под аниме или ответить на существующий комментарий',
  })
  @ApiParam({
    name: 'animeId',
    description: 'ID аниме',
    example: 123,
    type: Number,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Комментарий успешно создан',
    type: CommentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Пользователь не авторизован',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Аниме или родительский комментарий не найдены',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Некорректные данные или достигнута максимальная глубина вложенности',
  })
  async createComment(
    @Param('animeId', ParseIntPipe) animeId: number,
    @CurrentUser() user: User,
    @Body(new ValidationPipe({ transform: true })) dto: CreateCommentDto,
  ): Promise<CommentResponseDto> {
    return this.commentsService.create(animeId, user.id, dto);
  }

  @Get('anime/:animeId/comments')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: 'Получить комментарии к аниме',
    description: 'Возвращает список комментариев с пагинацией и сортировкой. Если пользователь авторизован, возвращает информацию о его реакциях.',
  })
  @ApiParam({
    name: 'animeId',
    description: 'ID аниме',
    example: 123,
    type: Number,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Список комментариев успешно получен',
    type: PaginatedCommentsResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Некорректные параметры пагинации',
  })
  async getCommentsByAnime(
    @Param('animeId', ParseIntPipe) animeId: number,
    @Query(new ValidationPipe({ transform: true })) dto: GetCommentsDto,
    @CurrentUser() user?: User,
  ): Promise<PaginatedCommentsResponseDto> {
    return this.commentsService.findAllByAnime(animeId, dto, user?.id);
  }

  @Get('comments/:id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: 'Получить комментарий по ID',
    description: 'Возвращает комментарий с вложенными ответами',
  })
  @ApiParam({
    name: 'id',
    description: 'ID комментария',
    example: 42,
    type: Number,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Комментарий успешно найден',
    type: CommentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Комментарий не найден',
  })
  async getComment(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user?: User,
  ): Promise<CommentResponseDto> {
    return this.commentsService.findOne(id, user?.id);
  }

  @Patch('comments/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Редактировать свой комментарий',
    description: 'Позволяет пользователю редактировать только свои комментарии',
  })
  @ApiParam({
    name: 'id',
    description: 'ID комментария',
    example: 42,
    type: Number,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Комментарий успешно обновлен',
    type: CommentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Пользователь не авторизован',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Недостаточно прав для редактирования комментария',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Комментарий не найден',
  })
  async updateComment(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
    @Body(new ValidationPipe({ transform: true })) dto: UpdateCommentDto,
  ): Promise<CommentResponseDto> {
    return this.commentsService.update(id, user.id, dto);
  }

  @Delete('comments/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Удалить комментарий',
    description: 'Позволяет пользователю удалить свой комментарий или модератору удалить любой комментарий',
  })
  @ApiParam({
    name: 'id',
    description: 'ID комментария',
    example: 42,
    type: Number,
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Комментарий успешно удален',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Пользователь не авторизован',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Недостаточно прав для удаления комментария',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Комментарий не найден',
  })
  async deleteComment(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.commentsService.remove(id, user.id, user.role);
  }

  @Post('comments/:id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Поставить лайк или дизлайк комментарию',
    description: 'Позволяет лайкнуть или дизлайкнуть комментарий. Повторный клик на ту же реакцию удаляет её.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID комментария',
    example: 42,
    type: Number,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Реакция успешно сохранена',
    schema: {
      type: 'object',
      properties: {
        likes_count: { type: 'number', example: 15 },
        dislikes_count: { type: 'number', example: 2 },
        is_liked: { type: 'boolean', nullable: true, example: true },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Пользователь не авторизован',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Комментарий не найден',
  })
  async likeComment(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
    @Body(new ValidationPipe({ transform: true })) dto: LikeCommentDto,
  ) {
    return this.commentsService.likeComment(id, user.id, dto);
  }

  @Delete('comments/:id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Убрать свою реакцию с комментария',
    description: 'Удаляет лайк или дизлайк пользователя с комментария',
  })
  @ApiParam({
    name: 'id',
    description: 'ID комментария',
    example: 42,
    type: Number,
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Реакция успешно удалена',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Пользователь не авторизован',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Реакция не найдена',
  })
  async removeLike(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.commentsService.removeLike(id, user.id);
  }

  @Post('comments/:id/report')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Пожаловаться на комментарий',
    description: 'Позволяет пользователю подать жалобу на неуместный комментарий',
  })
  @ApiParam({
    name: 'id',
    description: 'ID комментария',
    example: 42,
    type: Number,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Жалоба успешно отправлена',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Жалоба успешно отправлена' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Пользователь не авторизован',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Вы уже подавали жалобу на этот комментарий',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Комментарий не найден',
  })
  async reportComment(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
    @Body(new ValidationPipe({ transform: true })) dto: ReportCommentDto,
  ) {
    return this.commentsService.reportComment(id, user.id, dto);
  }
}
