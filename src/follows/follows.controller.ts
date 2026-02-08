import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FollowsService } from './follows.service';
import {
  FollowCheckResponseDto,
  PaginatedFollowsResponseDto,
} from './dto/follow-response.dto';
import { GetFollowsDto } from './dto/get-follows.dto';

@ApiTags('Follows')
@Controller('follows')
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Post(':userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Подписаться на пользователя' })
  @ApiParam({ name: 'userId', description: 'ID пользователя' })
  @ApiResponse({ status: 200, description: 'Подписка оформлена' })
  @ApiResponse({ status: 400, description: 'Некорректный запрос или уже подписаны' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  async follow(
    @CurrentUser('id') currentUserId: string,
    @Param('userId') userId: string,
  ): Promise<{ message: string }> {
    return this.followsService.follow(currentUserId, userId);
  }

  @Delete(':userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Отписаться от пользователя' })
  @ApiParam({ name: 'userId', description: 'ID пользователя' })
  @ApiResponse({ status: 200, description: 'Подписка отменена' })
  @ApiResponse({ status: 404, description: 'Подписка не найдена' })
  async unfollow(
    @CurrentUser('id') currentUserId: string,
    @Param('userId') userId: string,
  ): Promise<{ message: string }> {
    return this.followsService.unfollow(currentUserId, userId);
  }

  @Get('followers')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить мои подписчики' })
  @ApiResponse({
    status: 200,
    description: 'Список подписчиков',
    type: PaginatedFollowsResponseDto,
  })
  async getMyFollowers(
    @CurrentUser('id') currentUserId: string,
    @Query() dto: GetFollowsDto,
  ): Promise<PaginatedFollowsResponseDto> {
    return this.followsService.getFollowers(currentUserId, dto);
  }

  @Get('following')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить мои подписки' })
  @ApiResponse({
    status: 200,
    description: 'Список подписок',
    type: PaginatedFollowsResponseDto,
  })
  async getMyFollowing(
    @CurrentUser('id') currentUserId: string,
    @Query() dto: GetFollowsDto,
  ): Promise<PaginatedFollowsResponseDto> {
    return this.followsService.getFollowing(currentUserId, dto);
  }

  @Get(':userId/followers')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить подписчиков пользователя' })
  @ApiParam({ name: 'userId', description: 'ID пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Список подписчиков',
    type: PaginatedFollowsResponseDto,
  })
  async getUserFollowers(
    @Param('userId') userId: string,
    @Query() dto: GetFollowsDto,
  ): Promise<PaginatedFollowsResponseDto> {
    return this.followsService.getFollowers(userId, dto);
  }

  @Get(':userId/following')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить подписки пользователя' })
  @ApiParam({ name: 'userId', description: 'ID пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Список подписок',
    type: PaginatedFollowsResponseDto,
  })
  async getUserFollowing(
    @Param('userId') userId: string,
    @Query() dto: GetFollowsDto,
  ): Promise<PaginatedFollowsResponseDto> {
    return this.followsService.getFollowing(userId, dto);
  }

  @Get('check/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Проверить статус подписки' })
  @ApiParam({ name: 'userId', description: 'ID пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Статус подписки',
    type: FollowCheckResponseDto,
  })
  async checkFollow(
    @CurrentUser('id') currentUserId: string,
    @Param('userId') userId: string,
  ): Promise<FollowCheckResponseDto> {
    return this.followsService.checkFollowStatus(currentUserId, userId);
  }
}
