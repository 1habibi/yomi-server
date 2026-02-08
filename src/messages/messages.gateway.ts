import { UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { WsJwtGuard } from '../websocket/guards/ws-jwt.guard';
import { MessagesService } from './messages.service';

interface AuthenticatedSocket {
  id: string;
  data: {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
  };
  join: (room: string) => void;
  leave: (room: string) => void;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
  namespace: '/ws',
})
export class MessagesGateway {
  @WebSocketServer()
  server: Server;

  constructor(private messagesService: MessagesService) {}

  /**
   * Присоединиться к комнате диалога
   */
  @UseGuards(WsJwtGuard)
  @SubscribeMessage('message:join')
  async handleJoinConversation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: number },
  ) {
    const userId = client.data.user.id;
    const { conversationId } = data;

    try {
      await this.messagesService['verifyConversationAccess'](
        userId,
        conversationId,
      );

      const roomName = `conversation:${conversationId}`;
      client.join(roomName);
      console.log(`[WebSocket] User ${userId} joined room ${roomName}`);

      return { status: 'joined', conversationId };
    } catch (error) {
      console.error(
        `[WebSocket] Failed to join room: ${error.message}`,
        error,
      );
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Покинуть комнату диалога
   */
  @UseGuards(WsJwtGuard)
  @SubscribeMessage('message:leave')
  handleLeaveConversation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: number },
  ) {
    const { conversationId } = data;
    client.leave(`conversation:${conversationId}`);
    return { status: 'left', conversationId };
  }

  /**
   * Пользователь печатает
   */
  @UseGuards(WsJwtGuard)
  @SubscribeMessage('message:typing')
  handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: number; isTyping: boolean },
  ) {
    const userId = client.data.user.id;
    const userName = client.data.user.name;
    const { conversationId, isTyping } = data;

    this.server.to(`conversation:${conversationId}`).except(client.id).emit('message:typing', {
      conversationId,
      userId,
      userName,
      isTyping,
    });

    return { status: 'ok' };
  }

  /**
   * Отправить новое сообщение в реальном времени
   */
  sendNewMessage(conversationId: number, message: any) {
    const roomName = `conversation:${conversationId}`;
    console.log(
      `[WebSocket] Sending message:new to room ${roomName}, messageId: ${message.id}`,
    );
    this.server.to(roomName).emit('message:new', { message });
  }

  /**
   * Уведомить об изменении статуса сообщения
   */
  sendMessageStatus(
    conversationId: number,
    messageId: number,
    status: string,
    timestamp: Date,
  ) {
    this.server.to(`conversation:${conversationId}`).emit('message:status', {
      messageId,
      status,
      timestamp,
    });
  }

  /**
   * Уведомить об редактировании сообщения
   */
  sendMessageEdited(conversationId: number, message: any) {
    this.server
      .to(`conversation:${conversationId}`)
      .emit('message:edited', { message });
  }

  /**
   * Уведомить об удалении сообщения
   */
  sendMessageDeleted(conversationId: number, messageId: number) {
    this.server
      .to(`conversation:${conversationId}`)
      .emit('message:deleted', { messageId });
  }

  /**
   * Отправить уведомление о новом сообщении конкретному пользователю
   */
  sendMessageNotification(userId: string, data: any) {
    this.server.to(`user:${userId}`).emit('message:notification', data);
  }
}
