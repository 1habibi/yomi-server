import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { WatchTrackingController } from './watch-tracking.controller';
import { WatchTrackingService } from './watch-tracking.service';

@Module({
  imports: [PrismaModule],
  controllers: [WatchTrackingController],
  providers: [WatchTrackingService],
})
export class WatchTrackingModule {}
