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

/**
 * WebSocket Gateway для комментариев в реальном времени
 *
 * Позволяет подписываться на обновления комментариев конкретного аниме
 * и получать мгновенные уведомления о новых/измененных/удаленных комментариях.
 */
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
  namespace: '/ws',
})
export class CommentsGateway {
  @WebSocketServer()
  server: Server;

  /**
   * Подписаться на комментарии аниме
   */
  @UseGuards(WsJwtGuard)
  @SubscribeMessage('comment:join')
  handleJoinAnime(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { animeId: number },
  ) {
    const userId = client.data.user.id;
    const { animeId } = data;
    const roomName = `anime:${animeId}`;

    client.join(roomName);
    console.log(`[WebSocket] User ${userId} joined comments room ${roomName}`);

    return {
      status: 'joined',
      animeId,
    };
  }

  /**
   * Отписаться от комментариев аниме
   */
  @UseGuards(WsJwtGuard)
  @SubscribeMessage('comment:leave')
  handleLeaveAnime(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { animeId: number },
  ) {
    const userId = client.data.user.id;
    const { animeId } = data;
    const roomName = `anime:${animeId}`;

    client.leave(roomName);
    console.log(`[WebSocket] User ${userId} left comments room ${roomName}`);

    return {
      status: 'left',
      animeId,
    };
  }

  /**
   * Уведомить всех подписчиков о новом комментарии
   */
  notifyNewComment(animeId: number, comment: any) {
    const roomName = `anime:${animeId}`;
    console.log(`[WebSocket] Broadcasting new comment to ${roomName}`);

    this.server.to(roomName).emit('comment:new', {
      animeId,
      comment,
    });
  }

  /**
   * Уведомить всех подписчиков об изменении комментария
   */
  notifyCommentUpdated(animeId: number, commentId: number) {
    const roomName = `anime:${animeId}`;
    console.log(`[WebSocket] Broadcasting comment updated to ${roomName}`);

    this.server.to(roomName).emit('comment:updated', {
      animeId,
      commentId,
    });
  }

  /**
   * Уведомить всех подписчиков об удалении комментария
   */
  notifyCommentDeleted(animeId: number, commentId: number) {
    const roomName = `anime:${animeId}`;
    console.log(`[WebSocket] Broadcasting comment deleted to ${roomName}`);

    this.server.to(roomName).emit('comment:deleted', {
      animeId,
      commentId,
    });
  }

  /**
   * Уведомить всех подписчиков о реакции на комментарий (лайк/дизлайк)
   */
  notifyCommentReaction(animeId: number, commentId: number) {
    const roomName = `anime:${animeId}`;
    console.log(`[WebSocket] Broadcasting comment reaction to ${roomName}`);

    this.server.to(roomName).emit('comment:reaction', {
      animeId,
      commentId,
    });
  }
}
