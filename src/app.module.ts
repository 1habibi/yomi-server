import { Module } from '@nestjs/common';
import { AnimeModule } from './anime/anime.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from './config/config.module';
import { EmailModule } from './email/email.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { UsersModule } from './users/users.module';
import { UploadModule } from './upload/upload.module';

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
  ],
})
export class AppModule {}
