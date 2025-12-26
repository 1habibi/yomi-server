import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis, { Redis as RedisClient } from "ioredis";

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: RedisClient;

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.get<string>("REDIS_URL");
    if (!url) {
      throw new Error("REDIS_URL is not configured");
    }
    this.client = new Redis(url);
  }

  getClient(): RedisClient {
    return this.client;
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
  }
}

