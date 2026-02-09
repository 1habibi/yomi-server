import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { AnalyticsService } from './analytics.service';
import { TrackPageViewDto } from './dto/track-page-view.dto';
import { TrackSearchDto } from './dto/track-search.dto';

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(OptionalJwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('page-view')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Трекинг просмотра страницы аниме' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  async trackPageView(
    @CurrentUser() user: User | undefined,
    @Body(new ValidationPipe({ transform: true })) dto: TrackPageViewDto,
  ) {
    await this.analyticsService.trackPageView(user?.id ?? null, dto);
  }

  @Post('search')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Трекинг поискового запроса' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  async trackSearch(
    @CurrentUser() user: User | undefined,
    @Body(new ValidationPipe({ transform: true })) dto: TrackSearchDto,
  ) {
    await this.analyticsService.trackSearch(user?.id ?? null, dto);
  }
}
