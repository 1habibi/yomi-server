import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateWatchSessionDto } from './dto/create-watch-session.dto';
import { UpdateWatchSessionDto } from './dto/update-watch-session.dto';
import {
  EndWatchSessionResponseDto,
  WatchSessionResponseDto,
} from './dto/watch-session-response.dto';
import { WatchTrackingService } from './watch-tracking.service';

@ApiTags('Watch Tracking')
@Controller('watch-tracking')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WatchTrackingController {
  constructor(private readonly watchTrackingService: WatchTrackingService) {}

  @Post('sessions')
  @ApiOperation({ summary: 'Создать сессию просмотра' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Сессия создана',
    type: WatchSessionResponseDto,
  })
  async createSession(
    @CurrentUser() user: User,
    @Body(new ValidationPipe({ transform: true })) dto: CreateWatchSessionDto,
  ) {
    return this.watchTrackingService.createSession(user.id, dto);
  }

  @Patch('sessions/:id/heartbeat')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Heartbeat сессии просмотра' })
  async heartbeat(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) sessionId: number,
  ) {
    await this.watchTrackingService.heartbeat(user.id, sessionId);
  }

  @Patch('sessions/:id/end')
  @ApiOperation({ summary: 'Завершить сессию просмотра' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Сессия завершена',
    type: EndWatchSessionResponseDto,
  })
  async endSession(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) sessionId: number,
    @Body(new ValidationPipe({ transform: true })) dto: UpdateWatchSessionDto,
  ) {
    return this.watchTrackingService.endSession(user.id, sessionId, dto);
  }
}
