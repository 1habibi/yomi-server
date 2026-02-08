import { Module } from '@nestjs/common';
import { ActivityModule } from './activity/activity.module';
import { AnimeModule } from './anime/anime.module';
import { AuthModule } from './auth/auth.module';
import { BlocksModule } from './blocks/blocks.module';
import { CommentsModule } from './comments/comments.module';
import { ConfigModule } from './config/config.module';
import { EmailModule } from './email/email.module';
import { FollowsModule } from './follows/follows.module';
import { MessagesModule } from './messages/messages.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProfilesModule } from './profiles/profiles.module';
import { RedisModule } from './redis/redis.module';
import { ReviewsModule } from './reviews/reviews.module';
import { UploadModule } from './upload/upload.module';
import { UserAnimeModule } from './user-anime/user-anime.module';
import { UserSettingsModule } from './user-settings/user-settings.module';
import { UsersModule } from './users/users.module';
import { WebSocketModule } from './websocket/websocket.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    RedisModule,
    EmailModule,
    AuthModule,
    UsersModule,
    AnimeModule,
    UploadModule,
    CommentsModule,
    NotificationsModule,
    UserAnimeModule,
    UserSettingsModule,
    ReviewsModule,
    FollowsModule,
    BlocksModule,
    ProfilesModule,
    ActivityModule,
    WebSocketModule,
    MessagesModule,
  ],
})
export class AppModule {}
