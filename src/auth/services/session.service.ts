import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { User } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { v4 as uuidv4 } from "uuid";
import { PrismaService } from "../../prisma/prisma.service";
import { RedisService } from "../../redis/redis.service";

type SessionRecord = {
  userId: string;
  userAgent: string;
  ipAddress?: string | null;
  createdAt: number;
  lastSeenAt: number;
  absoluteExpiresAt: number;
  idleExpiresAt: number;
  refreshHash: string;
  revokedAt?: number | null;
};

@Injectable()
export class SessionService {
  private readonly idleTtlMs: number;
  private readonly absoluteTtlMs: number;
  private readonly redisPrefix: string;

  constructor(
    private readonly redisService: RedisService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.idleTtlMs = this.parseDuration(
      this.configService.get<string>("REFRESH_IDLE_TTL", "7d"),
    );
    this.absoluteTtlMs = this.parseDuration(
      this.configService.get<string>("REFRESH_ABSOLUTE_TTL", "30d"),
    );
    this.redisPrefix = this.configService.get<string>("REDIS_PREFIX") || "";
  }

  // Создание сессии Redis
  async createSession(
    userId: string,
    userAgent: string,
    ipAddress?: string,
  ): Promise<{ refreshToken: string; sessionId: string }> {
    // Генерация уникального sessionId
    const sessionId = uuidv4();
    const secret = this.generateSecret();
    const refreshHash = await this.hashSecret(secret);
    
    const now = Date.now();
    const absoluteExpiresAt = now + this.absoluteTtlMs;
    const idleExpiresAt = Math.min(now + this.idleTtlMs, absoluteExpiresAt);
    const ttlMs = Math.max(1, idleExpiresAt - now);

    const record: SessionRecord = {
      userId,
      userAgent,
      ipAddress,
      createdAt: now,
      lastSeenAt: now,
      absoluteExpiresAt,
      idleExpiresAt,
      refreshHash,
      revokedAt: null,
    };

    const client = this.redisService.getClient();
    await client.set(
      this.sessionKey(sessionId),
      JSON.stringify(record),
      "PX",
      ttlMs,
    );
    await client.zadd(this.userSessionsKey(userId), now, sessionId);

    return { refreshToken: this.composeToken(sessionId, secret), sessionId };
  }

  async rotateSession(
    refreshToken: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ refreshToken: string; sessionId: string; user: User }> {
    const parsed = this.parseToken(refreshToken);
    const session = await this.getSession(parsed.sessionId);

    if (!session) {
      throw new UnauthorizedException("Сессия не найдена или истекла");
    }

    this.ensureNotRevoked(session);
    this.ensureNotExpired(session);
    await this.ensureSecretMatches(session, parsed.secret, parsed.sessionId);

    const user = await this.prisma.user.findUnique({
      where: { id: session.userId },
    });
    if (!user) {
      await this.revokeSession(parsed.sessionId);
      throw new UnauthorizedException("Пользователь не найден");
    }

    const now = Date.now();
    const absoluteExpiresAt = session.absoluteExpiresAt;
    const idleExpiresAt = Math.min(now + this.idleTtlMs, absoluteExpiresAt);
    const ttlMs = Math.max(1, idleExpiresAt - now);

    const secret = this.generateSecret();
    const refreshHash = await this.hashSecret(secret);

    const updated: SessionRecord = {
      ...session,
      refreshHash,
      userAgent: userAgent || session.userAgent,
      ipAddress: ipAddress || session.ipAddress,
      lastSeenAt: now,
      idleExpiresAt,
    };

    const client = this.redisService.getClient();
    await client.set(
      this.sessionKey(parsed.sessionId),
      JSON.stringify(updated),
      "PX",
      ttlMs,
    );
    await client.zadd(this.userSessionsKey(session.userId), now, parsed.sessionId);

    return {
      refreshToken: this.composeToken(parsed.sessionId, secret),
      sessionId: parsed.sessionId,
      user,
    };
  }

  async validateRefreshToken(
    refreshToken: string,
  ): Promise<{ user: User; sessionId: string }> {
    const parsed = this.parseToken(refreshToken);
    const session = await this.getSession(parsed.sessionId);
    if (!session) {
      throw new UnauthorizedException("Сессия не найдена или истекла");
    }

    this.ensureNotRevoked(session);
    this.ensureNotExpired(session);
    await this.ensureSecretMatches(session, parsed.secret, parsed.sessionId);

    const user = await this.prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      await this.revokeSession(parsed.sessionId);
      throw new UnauthorizedException("Пользователь не найден");
    }

    await this.touchSession(parsed.sessionId, session);

    return { user, sessionId: parsed.sessionId };
  }

  async revokeSessionByToken(refreshToken: string): Promise<void> {
    const parsed = this.parseToken(refreshToken);
    await this.revokeSession(parsed.sessionId);
  }

  async revokeSession(sessionId: string, userId?: string): Promise<boolean> {
    const session = await this.getSession(sessionId);
    const client = this.redisService.getClient();
    if (!session) {
      return false;
    }
    if (userId && session.userId !== userId) {
      return false;
    }

    await client.del(this.sessionKey(sessionId));
    await client.zrem(this.userSessionsKey(session.userId), sessionId);
    return true;
  }

  async revokeAllForUser(userId: string): Promise<void> {
    const client = this.redisService.getClient();
    const sessionIds = await client.zrange(this.userSessionsKey(userId), 0, -1);
    if (sessionIds.length) {
      const pipeline = client.pipeline();
      sessionIds.forEach((id) => pipeline.del(this.sessionKey(id)));
      pipeline.del(this.userSessionsKey(userId));
      await pipeline.exec();
    }
  }

  async getSessionsForUser(userId: string, currentSessionId?: string) {
    const client = this.redisService.getClient();
    const sessionIds = await client.zrevrange(
      this.userSessionsKey(userId),
      0,
      -1,
    );

    const sessions = await Promise.all(
      sessionIds.map(async (id) => {
        const record = await this.getSession(id);
        if (!record) {
          await client.zrem(this.userSessionsKey(userId), id);
          return null;
        }

        return {
          id,
          userAgent: record.userAgent,
          ipAddress: record.ipAddress ?? null,
          lastActivity: new Date(record.lastSeenAt),
          createdAt: new Date(record.createdAt),
          expiresAt: new Date(record.idleExpiresAt),
          isCurrent: id === currentSessionId,
        };
      }),
    );

    return sessions.filter(Boolean);
  }

  async ensureSessionActive(sessionId: string): Promise<boolean> {
    const session = await this.getSession(sessionId);
    if (!session) {
      return false;
    }

    if (session.revokedAt) {
      return false;
    }

    if (session.absoluteExpiresAt <= Date.now()) {
      await this.revokeSession(sessionId);
      return false;
    }

    return true;
  }

  private async getSession(sessionId: string): Promise<SessionRecord | null> {
    const client = this.redisService.getClient();
    const raw = await client.get(this.sessionKey(sessionId));
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as SessionRecord;
    } catch (error) {
      await client.del(this.sessionKey(sessionId));
      return null;
    }
  }

  private async touchSession(
    sessionId: string,
    session: SessionRecord,
  ): Promise<void> {
    const now = Date.now();
    const absoluteExpiresAt = session.absoluteExpiresAt;
    const idleExpiresAt = Math.min(now + this.idleTtlMs, absoluteExpiresAt);
    const ttlMs = Math.max(1, idleExpiresAt - now);

    const updated: SessionRecord = {
      ...session,
      lastSeenAt: now,
      idleExpiresAt,
    };

    const client = this.redisService.getClient();
    await client.set(
      this.sessionKey(sessionId),
      JSON.stringify(updated),
      "PX",
      ttlMs,
    );
    await client.zadd(this.userSessionsKey(session.userId), now, sessionId);
  }

  private ensureNotRevoked(session: SessionRecord): void {
    if (session.revokedAt) {
      throw new UnauthorizedException("Сессия недействительна");
    }
  }

  private ensureNotExpired(session: SessionRecord): void {
    if (session.absoluteExpiresAt <= Date.now()) {
      throw new UnauthorizedException("Сессия истекла");
    }
  }

  private async ensureSecretMatches(
    session: SessionRecord,
    secret: string,
    sessionId?: string,
  ): Promise<void> {
    const match = await bcrypt.compare(secret, session.refreshHash);
    if (!match) {
      const id = sessionId || "";
      await this.revokeSession(id);
      throw new UnauthorizedException("Неверный refresh token");
    }
  }

  private generateSecret(): string {
    return randomBytes(32).toString("hex");
  }

  private async hashSecret(secret: string): Promise<string> {
    return bcrypt.hash(secret, 12);
  }

  private composeToken(sessionId: string, secret: string): string {
    return `${sessionId}.${secret}`;
  }

  private parseToken(token: string): { sessionId: string; secret: string } {
    const [sessionId, secret] = token.split(".");
    if (!sessionId || !secret) {
      throw new UnauthorizedException("Неверный refresh token");
    }
    return { sessionId, secret };
  }

  private sessionKey(sessionId: string): string {
    return `${this.redisPrefix}session:${sessionId}`;
  }

  private userSessionsKey(userId: string): string {
    return `${this.redisPrefix}user_sessions:${userId}`;
  }

  private parseDuration(value: string): number {
    const match = /^(\d+)([smhd])$/.exec(value);
    if (!match) {
      return 7 * 24 * 60 * 60 * 1000;
    }
    const num = parseInt(match[1], 10);
    const unit = match[2];
    switch (unit) {
      case "s":
        return num * 1000;
      case "m":
        return num * 60 * 1000;
      case "h":
        return num * 60 * 60 * 1000;
      case "d":
      default:
        return num * 24 * 60 * 60 * 1000;
    }
  }
}

