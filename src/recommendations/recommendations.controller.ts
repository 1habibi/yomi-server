import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DiscoveryResponseDto } from './dto/discovery.dto';
import { PersonalRecommendationsResponseDto } from './dto/recommendation-response.dto';
import { RecommendationsService } from './recommendations.service';

@ApiTags('Recommendations')
@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Get('personal')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Персональные рекомендации' })
  @ApiQuery({ name: 'top_n', required: false, type: Number })
  @ApiResponse({ status: 200, type: PersonalRecommendationsResponseDto })
  async getPersonal(
    @CurrentUser() user: User,
    @Query('top_n') topN = 20,
  ) {
    return this.recommendationsService.getPersonal(user.id, Number(topN));
  }

  @Get('similar/:animeId')
  @ApiOperation({ summary: 'Похожие аниме' })
  @ApiQuery({ name: 'top_n', required: false, type: Number })
  async getSimilar(
    @Param('animeId', ParseIntPipe) animeId: number,
    @Query('top_n') topN = 10,
  ) {
    return this.recommendationsService.getSimilar(animeId, Number(topN));
  }

  @Get('popular')
  @ApiOperation({ summary: 'Популярные аниме' })
  @ApiQuery({ name: 'top_n', required: false, type: Number })
  async getPopular(@Query('top_n') topN = 20) {
    return this.recommendationsService.getPopular(Number(topN));
  }

  @Get('trending')
  @ApiOperation({ summary: 'Трендовые аниме' })
  @ApiQuery({ name: 'top_n', required: false, type: Number })
  async getTrending(@Query('top_n') topN = 20) {
    return this.recommendationsService.getTrending(Number(topN));
  }

  @Get('discovery')
  @ApiOperation({ summary: 'Нейропоиск аниме по естественному описанию' })
  @ApiQuery({ name: 'query', required: true, type: String, description: 'Описание желаемого аниме' })
  @ApiQuery({ name: 'top_n', required: false, type: Number })
  @ApiQuery({ name: 'min_score', required: false, type: Number })
  @ApiQuery({ name: 'genres', required: false, type: [String] })
  @ApiQuery({ name: 'min_rating', required: false, type: Number })
  @ApiResponse({ status: 200, type: DiscoveryResponseDto })
  async searchDiscovery(
    @Query('query') query: string,
    @Query('top_n') topN = 20,
    @Query('min_score') minScore = 0.3,
    @Query('genres') genres?: string | string[],
    @Query('min_rating') minRating?: number,
  ) {
    const genresArray = genres
      ? Array.isArray(genres)
        ? genres
        : [genres]
      : undefined;

    return this.recommendationsService.searchDiscovery(
      query,
      Number(topN),
      Number(minScore),
      genresArray,
      minRating ? Number(minRating) : undefined,
    );
  }
}
