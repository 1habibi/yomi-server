import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { WebSocketGatewayHandler } from './websocket.gateway';
import { WebSocketService } from './websocket.service';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '15m' },
    }),
  ],
  providers: [WebSocketGatewayHandler, WebSocketService, WsJwtGuard],
  exports: [WebSocketGatewayHandler, WebSocketService, WsJwtGuard, JwtModule],
})
export class WebSocketModule {}
