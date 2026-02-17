import { Module } from '@nestjs/common';
import { ActivityModule } from '../activity/activity.module';
import { PrismaModule } from '../prisma/prisma.module';
import { WebSocketModule } from '../websocket/websocket.module';
import { CommentsController } from './comments.controller';
import { CommentsGateway } from './comments.gateway';
import { CommentsService } from './comments.service';

@Module({
  imports: [PrismaModule, ActivityModule, WebSocketModule],
  controllers: [CommentsController],
  providers: [CommentsService, CommentsGateway],
  exports: [CommentsService],
})
export class CommentsModule {}
