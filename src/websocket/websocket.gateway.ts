import { UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { WebSocketService } from './websocket.service';

interface AuthenticatedSocket extends Socket {
  data: {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
  };
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
  namespace: '/ws',
})
export class WebSocketGatewayHandler
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private userConnections = new Map<string, Set<string>>();

  constructor(private webSocketService: WebSocketService) {}

  /**
   * Обработка нового подключения
   */
  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  /**
   * Обработка отключения
   */
  async handleDisconnect(client: AuthenticatedSocket) {
    console.log(`Client disconnected: ${client.id}`);

    const userId = client.data?.user?.id;
    if (userId) {
      const userSockets = this.userConnections.get(userId);
      if (userSockets) {
        userSockets.delete(client.id);

        if (userSockets.size === 0) {
          this.userConnections.delete(userId);
          await this.webSocketService.setUserOffline(userId);

          this.server.emit('user:offline', { userId });
        }
      }
    }
  }

  /**
   * Аутентификация и установка онлайн-статуса
   */
  @UseGuards(WsJwtGuard)
  @SubscribeMessage('authenticate')
  async handleAuthenticate(@ConnectedSocket() client: AuthenticatedSocket) {
    const userId = client.data.user.id;

    if (!this.userConnections.has(userId)) {
      this.userConnections.set(userId, new Set());
    }
    this.userConnections.get(userId)!.add(client.id);

    await this.webSocketService.setUserOnline(userId);

    client.join(`user:${userId}`);

    this.server.emit('user:online', { userId });

    return {
      status: 'authenticated',
      userId,
    };
  }

  /**
   * Heartbeat для поддержания онлайн-статуса
   */
  @UseGuards(WsJwtGuard)
  @SubscribeMessage('heartbeat')
  async handleHeartbeat(@ConnectedSocket() client: AuthenticatedSocket) {
    const userId = client.data.user.id;
    await this.webSocketService.refreshOnlineStatus(userId);
    return { status: 'ok' };
  }

  /**
   * Отправить уведомление конкретному пользователю
   */
  sendNotificationToUser(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('notification:new', notification);
  }

  /**
   * Отправить событие конкретному пользователю
   */
  sendEventToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  /**
   * Проверить, онлайн ли пользователь (имеет активные соединения)
   */
  isUserConnected(userId: string): boolean {
    const userSockets = this.userConnections.get(userId);
    return !!userSockets && userSockets.size > 0;
  }

  /**
   * Получить количество активных соединений пользователя
   */
  getUserConnectionsCount(userId: string): number {
    const userSockets = this.userConnections.get(userId);
    return userSockets?.size ?? 0;
  }
}
