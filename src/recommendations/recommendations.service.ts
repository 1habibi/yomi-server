import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

const CACHE_TTL = {
  personal: 15 * 60,    // 15 min
  similar: 60 * 60,     // 1 hour
  popular: 30 * 60,     // 30 min
  trending: 30 * 60,    // 30 min
  discovery: 5 * 60,    // 5 min
};

const AI_REQUEST_TIMEOUT_MS = 10_000;

@Injectable()
export class RecommendationsService {
  private readonly logger = new Logger(RecommendationsService.name);
  private readonly aiServiceUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly config: ConfigService,
  ) {
    this.aiServiceUrl = this.config
      .get<string>('AI_SERVICE_URL', 'http://127.0.0.1:8001')
      .replace(/\/$/, '');
  }

  async getPersonal(userId: string, topN = 20) {
    const cacheKey = `rec:personal:${userId}:${topN}`;
    const cached = await this.redis.getClient().get(cacheKey);
    if (cached) return JSON.parse(cached);

    const aiData = await this.fetchAi(`/recommendations/user/${userId}?top_n=${topN}`);
    const enriched = await this.enrichWithAnimeData(aiData.recommendations);

    const result = {
      recommendations: enriched,
      total: enriched.length,
      user_type: aiData.user_type,
    };

    await this.redis.getClient().setex(cacheKey, CACHE_TTL.personal, JSON.stringify(result));
    return result;
  }

  async getSimilar(animeId: number, topN = 10) {
    const cacheKey = `rec:similar:${animeId}:${topN}`;
    const cached = await this.redis.getClient().get(cacheKey);
    if (cached) return JSON.parse(cached);

    const aiData = await this.fetchAi(`/similar/${animeId}?top_n=${topN}`);
    const enriched = await this.enrichWithAnimeData(aiData.similar);

    const result = { anime_id: animeId, similar: enriched, total: enriched.length };
    await this.redis.getClient().setex(cacheKey, CACHE_TTL.similar, JSON.stringify(result));
    return result;
  }

  async getPopular(topN = 20) {
    const cacheKey = `rec:popular:${topN}`;
    const cached = await this.redis.getClient().get(cacheKey);
    if (cached) return JSON.parse(cached);

    const aiData = await this.fetchAi(`/popular?top_n=${topN}`);
    const enriched = await this.enrichWithAnimeData(aiData.items);

    const result = { items: enriched, total: enriched.length };
    await this.redis.getClient().setex(cacheKey, CACHE_TTL.popular, JSON.stringify(result));
    return result;
  }

  async getTrending(topN = 20) {
    const cacheKey = `rec:trending:${topN}`;
    const cached = await this.redis.getClient().get(cacheKey);
    if (cached) return JSON.parse(cached);

    const aiData = await this.fetchAi(`/popular/trending?top_n=${topN}`);
    const enriched = await this.enrichWithAnimeData(aiData.items);

    const result = { items: enriched, total: enriched.length };
    await this.redis.getClient().setex(cacheKey, CACHE_TTL.trending, JSON.stringify(result));
    return result;
  }

  async searchDiscovery(
    query: string,
    topN = 20,
    minScore = 0.3,
    genres?: string[],
    minRating?: number,
  ) {
    const cacheKey = `rec:discovery:${query}:${topN}:${minScore}:${genres?.join(',')}:${minRating}`;
    const cached = await this.redis.getClient().get(cacheKey);
    if (cached) return JSON.parse(cached);

    const params = new URLSearchParams();
    params.append('query', query);
    params.append('top_n', topN.toString());
    params.append('min_score', minScore.toString());
    if (genres?.length) {
      genres.forEach(g => params.append('genres', g));
    }
    if (minRating !== undefined) {
      params.append('min_rating', minRating.toString());
    }

    const aiData = await this.fetchAi(`/discovery/search?${params.toString()}`, { method: 'POST' });

    const enriched = await this.enrichDiscoveryResults(aiData.results);

    const result = {
      results: enriched,
      parsed_query: aiData.parsed_query,
      total: enriched.length,
      query: aiData.query,
    };

    await this.redis.getClient().setex(cacheKey, CACHE_TTL.discovery, JSON.stringify(result));
    return result;
  }

  async invalidatePersonalCache(userId: string) {
    const keys = await this.redis.getClient().keys(`rec:personal:${userId}:*`);
    if (keys.length > 0) {
      await this.redis.getClient().del(...keys);
    }
  }

  private async enrichDiscoveryResults(items: any[]) {
    if (!items?.length) return [];

    const animeIds = items.map((i) => i.anime_id);
    const animeList = await this.prisma.anime.findMany({
      where: { id: { in: animeIds } },
      select: {
        id: true,
        title: true,
        title_orig: true,
        poster_url: true,
        shikimori_rating: true,
        year: true,
        anime_kind: true,
      },
    });

    const animeMap = new Map(animeList.map((a) => [a.id, a]));
    return items
      .filter((item) => animeMap.has(item.anime_id))
      .map((item) => ({
        ...item,
        anime: animeMap.get(item.anime_id),
      }));
  }

  private async fetchAi(path: string, options?: { method?: string }) {
    const url = `${this.aiServiceUrl}${path}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), AI_REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch(url, {
        method: options?.method || 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) {
        const errorText = await res.text().catch(() => 'Unknown error');
        throw new Error(`AI service responded with ${res.status}: ${errorText}`);
      }
      return res.json();
    } catch (err) {
      this.logger.error(`AI service request failed (${url}): ${this.formatAiError(err)}`);
      throw new ServiceUnavailableException('Recommendation service unavailable');
    } finally {
      clearTimeout(timeout);
    }
  }

  private formatAiError(err: unknown) {
    if (!(err instanceof Error)) return String(err);

    const cause = (err as Error & { cause?: unknown }).cause;
    if (!cause || typeof cause !== 'object') {
      return `${err.name}: ${err.message}`;
    }

    const details = cause as {
      code?: string;
      address?: string;
      port?: number;
      message?: string;
    };
    const endpoint = details.address && details.port ? ` ${details.address}:${details.port}` : '';
    const causeMessage = details.code
      ? `${details.code}${endpoint}`
      : details.message;

    return causeMessage
      ? `${err.name}: ${err.message}; cause: ${causeMessage}`
      : `${err.name}: ${err.message}`;
  }

  private async enrichWithAnimeData(items: Array<{ anime_id: number; score: number; source?: string }>) {
    if (!items?.length) return [];

    const animeIds = items.map((i) => i.anime_id);
    const animeList = await this.prisma.anime.findMany({
      where: { id: { in: animeIds } },
      select: {
        id: true,
        title: true,
        title_orig: true,
        poster_url: true,
        shikimori_rating: true,
        year: true,
        anime_kind: true,
      },
    });

    const animeMap = new Map(animeList.map((a) => [a.id, a]));
    return items
      .filter((item) => animeMap.has(item.anime_id))
      .map((item) => ({
        anime_id: item.anime_id,
        score: item.score,
        source: item.source ?? 'hybrid',
        anime: animeMap.get(item.anime_id),
      }));
  }
}
