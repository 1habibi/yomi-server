import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ActivityService } from './activity.service';
import { PaginatedActivityResponseDto } from './dto/activity-response.dto';
import { GetActivityDto } from './dto/get-activity.dto';

@ApiTags('Activity')
@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить мою активность' })
  @ApiResponse({
    status: 200,
    description: 'Моя активность',
    type: PaginatedActivityResponseDto,
  })
  async getMyActivity(
    @CurrentUser('id') currentUserId: string,
    @Query() dto: GetActivityDto,
  ): Promise<PaginatedActivityResponseDto> {
    return this.activityService.getUserActivity(
      currentUserId,
      dto,
      currentUserId,
    );
  }

  @Get('feed')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить ленту активности друзей' })
  @ApiResponse({
    status: 200,
    description: 'Лента друзей',
    type: PaginatedActivityResponseDto,
  })
  async getFeed(
    @CurrentUser('id') currentUserId: string,
    @Query() dto: GetActivityDto,
  ): Promise<PaginatedActivityResponseDto> {
    return this.activityService.getFriendsActivity(currentUserId, dto);
  }

  @Get('user/:userId')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Получить активность пользователя' })
  @ApiParam({ name: 'userId', description: 'ID пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Активность пользователя',
    type: PaginatedActivityResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Активность приватная' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  async getUserActivity(
    @Param('userId') userId: string,
    @Query() dto: GetActivityDto,
    @CurrentUser('id') currentUserId?: string,
  ): Promise<PaginatedActivityResponseDto> {
    return this.activityService.getUserActivity(userId, dto, currentUserId);
  }
}
