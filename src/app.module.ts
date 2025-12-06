import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AnimeModule } from './anime/anime.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from './config/config.module';
import { EmailModule } from './email/email.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule,
    ScheduleModule.forRoot(),
    PrismaModule,
    EmailModule,
    AuthModule,
    UsersModule,
    AnimeModule,
  ],
})
export class AppModule {}
