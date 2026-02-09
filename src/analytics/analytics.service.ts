import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TrackPageViewDto } from './dto/track-page-view.dto';
import { TrackSearchDto } from './dto/track-search.dto';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async trackPageView(userId: string | null, dto: TrackPageViewDto): Promise<void> {
    await this.prisma.animePageView.create({
      data: {
        user_id: userId,
        anime_id: dto.anime_id,
        session_id: dto.session_id,
        duration_ms: dto.duration_ms,
        referrer: dto.referrer,
      },
    });
  }

  async trackSearch(userId: string | null, dto: TrackSearchDto): Promise<void> {
    await this.prisma.searchQuery.create({
      data: {
        user_id: userId,
        query: dto.query,
        results_count: dto.results_count ?? 0,
        clicked_anime_id: dto.clicked_anime_id,
        session_id: dto.session_id,
      },
    });
  }
}
