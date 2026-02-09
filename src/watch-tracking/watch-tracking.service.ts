import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWatchSessionDto } from './dto/create-watch-session.dto';
import { UpdateWatchSessionDto } from './dto/update-watch-session.dto';

@Injectable()
export class WatchTrackingService {
  constructor(private readonly prisma: PrismaService) {}

  async createSession(userId: string, dto: CreateWatchSessionDto) {
    return this.prisma.watchSession.create({
      data: {
        user_id: userId,
        anime_id: dto.anime_id,
        episode: dto.episode,
        season: dto.season,
        translation_id: dto.translation_id,
        translation_title: dto.translation_title,
        duration_seconds: dto.duration_seconds,
        watched_seconds: 0,
        max_position: 0,
        completion_ratio: 0,
      },
      select: { id: true },
    });
  }

  async heartbeat(userId: string, sessionId: number) {
    const session = await this.prisma.watchSession.findFirst({
      where: { id: sessionId, user_id: userId },
    });
    if (!session) throw new NotFoundException('Watch session not found');

    return this.prisma.watchSession.update({
      where: { id: sessionId },
      data: { last_heartbeat: new Date() },
      select: { id: true },
    });
  }

  async endSession(userId: string, sessionId: number, dto: UpdateWatchSessionDto) {
    const session = await this.prisma.watchSession.findFirst({
      where: { id: sessionId, user_id: userId },
    });
    if (!session) throw new NotFoundException('Watch session not found');

    const watchedSeconds = dto.watched_seconds ?? session.watched_seconds;
    const duration = session.duration_seconds;
    const completionRatio = duration > 0 ? Math.min(1, watchedSeconds / duration) : 0;

    return this.prisma.watchSession.update({
      where: { id: sessionId },
      data: {
        watched_seconds: watchedSeconds,
        max_position: dto.max_position ?? session.max_position,
        completion_ratio: completionRatio,
        playback_speed: dto.playback_speed ?? session.playback_speed,
        skipped_intro: dto.skipped_intro ?? session.skipped_intro,
        skipped_outro: dto.skipped_outro ?? session.skipped_outro,
        seek_count: dto.seek_count ?? session.seek_count,
        pause_count: dto.pause_count ?? session.pause_count,
        ended_at: new Date(),
      },
      select: { id: true, completion_ratio: true },
    });
  }
}
