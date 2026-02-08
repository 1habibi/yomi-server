import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ProfilesService } from './profiles.service';
import {
  ProfileStatsResponseDto,
  PublicProfileResponseDto,
} from './dto/public-profile-response.dto';

@ApiTags('Profiles')
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get(':userId')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Получить публичный профиль пользователя' })
  @ApiParam({ name: 'userId', description: 'ID пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Публичный профиль',
    type: PublicProfileResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  async getPublicProfile(
    @Param('userId') userId: string,
    @CurrentUser('id') currentUserId?: string,
  ): Promise<PublicProfileResponseDto> {
    return this.profilesService.getPublicProfile(userId, currentUserId);
  }

  @Get(':userId/stats')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Получить статистику профиля пользователя' })
  @ApiParam({ name: 'userId', description: 'ID пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Статистика профиля',
    type: ProfileStatsResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Списки приватные' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  async getProfileStats(
    @Param('userId') userId: string,
    @CurrentUser('id') currentUserId?: string,
  ): Promise<ProfileStatsResponseDto> {
    return this.profilesService.getProfileStats(userId, currentUserId);
  }
}
