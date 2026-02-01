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
  Put,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { InteractionType, User } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { AddToListDto } from './dto/add-to-list.dto';
import { ReorderListDto } from './dto/reorder-list.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { UserAnimeResponseDto } from './dto/user-anime-response.dto';
import { UserListsResponseDto } from './dto/user-lists-response.dto';
import { UserAnimeService } from './user-anime.service';

@ApiTags('User Anime Lists')
@Controller('user-anime')
export class UserAnimeController {
  constructor(private readonly userAnimeService: UserAnimeService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Добавить аниме в список',
    description:
      'Позволяет добавить аниме в один из предопределенных списков (Смотрю, Просмотрено, В планах и т.д.). Основные статусы взаимоисключающие, дополнительные флаги можно комбинировать.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Аниме успешно добавлено в список',
    type: UserAnimeResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Конфликт списков или аниме уже в списке',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Аниме не найдено',
  })
  async addToList(
    @CurrentUser() user: User,
    @Body(new ValidationPipe({ transform: true })) dto: AddToListDto,
  ): Promise<UserAnimeResponseDto> {
    return this.userAnimeService.addToList(user.id, dto);
  }

  @Delete(':animeId/list/:listType')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Удалить аниме из конкретного списка',
    description: 'Удаляет аниме из указанного списка, но оставляет в других списках (если есть)',
  })
  @ApiParam({
    name: 'animeId',
    description: 'ID аниме',
    example: 123,
  })
  @ApiParam({
    name: 'listType',
    description: 'Тип списка',
    enum: InteractionType,
    example: InteractionType.WATCHING,
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Аниме успешно удалено из списка',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Аниме не найдено в указанном списке',
  })
  async removeFromList(
    @CurrentUser() user: User,
    @Param('animeId', ParseIntPipe) animeId: number,
    @Param('listType') listType: InteractionType,
  ): Promise<void> {
    return this.userAnimeService.removeFromList(user.id, animeId, listType);
  }

  @Delete(':animeId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Удалить аниме из всех списков',
    description: 'Полностью удаляет аниме из всех списков пользователя',
  })
  @ApiParam({
    name: 'animeId',
    description: 'ID аниме',
    example: 123,
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Аниме успешно удалено из всех списков',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Аниме не найдено в списках пользователя',
  })
  async removeFromAllLists(
    @CurrentUser() user: User,
    @Param('animeId', ParseIntPipe) animeId: number,
  ): Promise<void> {
    return this.userAnimeService.removeFromAllLists(user.id, animeId);
  }

  @Patch(':animeId/rating')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Обновить оценку аниме',
    description:
      'Обновляет оценку аниме (1-10). Оценка общая для всех списков, в которых находится аниме.',
  })
  @ApiParam({
    name: 'animeId',
    description: 'ID аниме',
    example: 123,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Оценка успешно обновлена',
    type: UserAnimeResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Аниме не найдено в списках пользователя',
  })
  async updateRating(
    @CurrentUser() user: User,
    @Param('animeId', ParseIntPipe) animeId: number,
    @Body(new ValidationPipe({ transform: true })) dto: UpdateRatingDto,
  ): Promise<UserAnimeResponseDto> {
    return this.userAnimeService.updateRating(user.id, animeId, dto);
  }

  @Put('reorder')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Пересортировать список',
    description:
      'Обновляет порядок аниме в указанном списке. Используется для drag-and-drop сортировки.',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Список успешно пересортирован',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Некоторые аниме не найдены в списке',
  })
  async reorderList(
    @CurrentUser() user: User,
    @Body(new ValidationPipe({ transform: true })) dto: ReorderListDto,
  ): Promise<void> {
    return this.userAnimeService.reorderList(user.id, dto);
  }

  @Get('status/:animeId')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: 'Получить статус конкретного аниме',
    description:
      'Возвращает информацию о том, в каких списках находится аниме у текущего пользователя. Если пользователь не авторизован - возвращает null.',
  })
  @ApiParam({
    name: 'animeId',
    description: 'ID аниме',
    example: 123,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Статус аниме получен',
    type: UserAnimeResponseDto,
  })
  async getAnimeStatus(
    @Param('animeId', ParseIntPipe) animeId: number,
    @CurrentUser() user?: User,
  ): Promise<UserAnimeResponseDto | null> {
    if (!user) {
      return null;
    }
    return this.userAnimeService.getAnimeStatus(user.id, animeId);
  }

  @Get('my-lists')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Получить все списки текущего пользователя',
    description:
      'Возвращает все списки пользователя, сгруппированные по типам, вместе со статистикой.',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    enum: ['date', 'rating', 'title', 'custom'],
    description: 'Сортировка аниме в списках',
    example: 'custom',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Списки успешно получены',
    type: UserListsResponseDto,
  })
  async getMyLists(
    @CurrentUser() user: User,
    @Query('sort') sort?: 'date' | 'rating' | 'title' | 'custom',
  ): Promise<UserListsResponseDto> {
    return this.userAnimeService.getMyLists(user.id, sort);
  }

  @Get('list/:listType')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Получить аниме из конкретного списка',
    description: 'Возвращает все аниме из указанного списка',
  })
  @ApiParam({
    name: 'listType',
    description: 'Тип списка',
    enum: InteractionType,
    example: InteractionType.WATCHING,
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    enum: ['date', 'rating', 'title', 'custom'],
    description: 'Сортировка аниме',
    example: 'custom',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Список успешно получен',
    type: [UserAnimeResponseDto],
  })
  async getListByType(
    @CurrentUser() user: User,
    @Param('listType') listType: InteractionType,
    @Query('sort') sort?: 'date' | 'rating' | 'title' | 'custom',
  ): Promise<UserAnimeResponseDto[]> {
    return this.userAnimeService.getListByType(user.id, listType, sort);
  }

  @Get('users/:userId/lists')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: 'Получить публичные списки пользователя',
    description:
      'Возвращает списки указанного пользователя. Если списки приватные - возвращает 403. Если запрашивает сам владелец - показывает все списки независимо от настроек приватности.',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID пользователя',
    example: 'cuid123',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    enum: ['date', 'rating', 'title', 'custom'],
    description: 'Сортировка аниме в списках',
    example: 'custom',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Списки успешно получены',
    type: UserListsResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Списки этого пользователя приватные',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Пользователь не найден',
  })
  async getUserLists(
    @Param('userId') userId: string,
    @CurrentUser() requestingUser?: User,
    @Query('sort') sort?: 'date' | 'rating' | 'title' | 'custom',
  ): Promise<UserListsResponseDto> {
    return this.userAnimeService.getUserLists(
      userId,
      requestingUser?.id,
      sort,
    );
  }
}
