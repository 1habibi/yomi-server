import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class WebSocketService {
  // Время жизни онлайн-статуса в Redis (60 секунд)
  private readonly ONLINE_TTL = 60;

  constructor(private redisService: RedisService) {}

  /**
   * Установить пользователя онлайн
   */
  async setUserOnline(userId: string): Promise<void> {
    const client = this.redisService.getClient();
    const key = `online:${userId}`;
    await client.set(key, Date.now().toString(), 'EX', this.ONLINE_TTL);
  }

  /**
   * Установить пользователя оффлайн
   */
  async setUserOffline(userId: string): Promise<void> {
    const client = this.redisService.getClient();
    const key = `online:${userId}`;
    await client.del(key);
  }

  /**
   * Проверить, онлайн ли пользователь
   */
  async isUserOnline(userId: string): Promise<boolean> {
    const client = this.redisService.getClient();
    const key = `online:${userId}`;
    const result = await client.get(key);
    return !!result;
  }

  /**
   * Получить список онлайн пользователей из массива ID
   */
  async getOnlineUsers(userIds: string[]): Promise<string[]> {
    if (userIds.length === 0) return [];

    const client = this.redisService.getClient();
    const keys = userIds.map((id) => `online:${id}`);
    const results = await client.mget(...keys);

    const onlineUsers: string[] = [];
    results.forEach((result, index) => {
      if (result) {
        onlineUsers.push(userIds[index]);
      }
    });

    return onlineUsers;
  }

  /**
   * Обновить timestamp онлайн-статуса (используется для heartbeat)
   */
  async refreshOnlineStatus(userId: string): Promise<void> {
    await this.setUserOnline(userId);
  }
}
