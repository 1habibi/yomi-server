import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const AI_REQUEST_TIMEOUT_MS = 10_000;

@Injectable()
export class CharacterSearchService {
  private readonly logger = new Logger(CharacterSearchService.name);
  private readonly aiServiceUrl: string;

  constructor(private readonly config: ConfigService) {
    this.aiServiceUrl = this.config
      .get<string>('AI_SERVICE_URL', 'http://127.0.0.1:8001')
      .replace(/\/$/, '');
  }

  async searchSingle(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    topK: number = 20,
  ) {
    return this.fetchAiMultipart(
      `/character-search/search?top_k=${topK}`,
      fileBuffer,
      fileName,
      mimeType,
    );
  }

  async searchMulti(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    minFaceConfidence: number = 0.5,
    topKPerFace: number = 3,
  ) {
    const params = new URLSearchParams({
      min_face_confidence: String(minFaceConfidence),
      top_k_per_face: String(topKPerFace),
    });
    return this.fetchAiMultipart(
      `/character-search/search-multi?${params}`,
      fileBuffer,
      fileName,
      mimeType,
    );
  }

  /**
   * Фильтрация результатов для контекста плеера.
   * Если среди найденных есть персонажи из текущего аниме — возвращает только их.
   * Это повышает точность при поиске из плеера.
   */
  filterByAnimeContext(data: any, animeTitle: string) {
    if (!animeTitle || !data) return data;

    const normalizedTitle = animeTitle.toLowerCase().trim();

    const matchesTitle = (str: string) => {
      const norm = str.toLowerCase();
      return norm.includes(normalizedTitle) || normalizedTitle.includes(norm);
    };

    // Для single search
    if (data.results) {
      const contextMatches = data.results.filter((r: any) => {
        return (
          matchesTitle(r.anime) ||
          r.all_anime?.some((a: string) => matchesTitle(a))
        );
      });

      if (contextMatches.length > 0) {
        return {
          ...data,
          results: contextMatches,
          aggregated: (data.aggregated ?? []).filter((a: any) => matchesTitle(a.anime)),
          context_filtered: true,
        };
      }
    }

    // Для multi search
    if (data.detected_characters) {
      const contextMatches = data.detected_characters.filter((c: any) =>
        matchesTitle(c.anime),
      );

      if (contextMatches.length > 0) {
        return {
          ...data,
          detected_characters: contextMatches,
          total_detected: contextMatches.length,
          context_filtered: true,
        };
      }
    }

    return { ...data, context_filtered: false };
  }

  /**
   * Отправка файла multipart/form-data к AI-сервису.
   * Использует нативный fetch + FormData (Node 18+).
   */
  private async fetchAiMultipart(
    path: string,
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
  ) {
    const url = `${this.aiServiceUrl}${path}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), AI_REQUEST_TIMEOUT_MS);

    try {
      const formData = new FormData();
      formData.append('file', new Blob([fileBuffer], { type: mimeType }), fileName);

      const res = await fetch(url, {
        method: 'POST',
        signal: controller.signal,
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text().catch(() => 'Unknown error');
        this.logger.error(`AI service responded with ${res.status}: ${errorText}`);
        throw new Error(`AI service responded with ${res.status}`);
      }

      return res.json();
    } catch (err) {
      this.logger.error(
        `Character search AI service request failed (${url}): ${this.formatAiError(err)}`,
      );
      throw new ServiceUnavailableException('Character search service unavailable');
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
}
