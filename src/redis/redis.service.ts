import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis, { Redis as RedisClient } from "ioredis";

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly client: RedisClient;
  private readonly logger = new Logger(RedisService.name);

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.get<string>("REDIS_URL");
    if (!url) {
      throw new Error("REDIS_URL is not configured");
    }

    this.client = new Redis(url, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) {
          this.logger.error("Redis connection failed after 3 retries");
          return null;
        }
        const delay = Math.min(times * 100, 2000);
        return delay;
      },
      lazyConnect: true,
    });

    this.client.on("error", (err) => {
      this.logger.error(`Redis connection error: ${err.message}`);
    });

    this.client.on("connect", () => {
      this.logger.log("Redis connected successfully");
    });

    this.client.on("ready", () => {
      this.logger.log("Redis ready to accept commands");
    });

    this.client.on("close", () => {
      this.logger.warn("Redis connection closed");
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.client.connect();
      await this.client.ping();
      this.logger.log("Redis connection verified");
    } catch (error) {
      this.logger.error("Failed to connect to Redis. Make sure Redis is running.");
      throw new Error(
        `Redis connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  getClient(): RedisClient {
    return this.client;
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
  }
}

