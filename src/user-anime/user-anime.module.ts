import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UserSettingsModule } from '../user-settings/user-settings.module';
import { UserAnimeController } from './user-anime.controller';
import { UserAnimeService } from './user-anime.service';

@Module({
  imports: [PrismaModule, UserSettingsModule],
  controllers: [UserAnimeController],
  providers: [UserAnimeService],
  exports: [UserAnimeService],
})
export class UserAnimeModule {}
