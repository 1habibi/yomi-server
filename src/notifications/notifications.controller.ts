import {
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiExtraModels, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetNotificationsDto } from './dto/get-notifications.dto';
import { NotificationResponseDto } from './dto/notification-response.dto';
import { PaginatedNotificationsResponseDto } from './dto/paginated-notifications-response.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiExtraModels(NotificationResponseDto)
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({
    summary: 'Получить список уведомлений',
    description: 'Возвращает список уведомлений пользователя с пагинацией и фильтрацией по статусу прочтения',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Список уведомлений успешно получен',
    type: PaginatedNotificationsResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Пользователь не авторизован',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Некорректные параметры пагинации',
  })
  async getNotifications(
    @CurrentUser() user: User,
    @Query(new ValidationPipe({ transform: true })) dto: GetNotificationsDto,
  ): Promise<PaginatedNotificationsResponseDto> {
    return this.notificationsService.findAll(user.id, dto);
  }

  @Get('unread-count')
  @ApiOperation({
    summary: 'Получить количество непрочитанных уведомлений',
    description: 'Возвращает количество непрочитанных уведомлений текущего пользователя',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Количество успешно получено',
    schema: {
      type: 'object',
      properties: {
        count: { type: 'number', example: 5 },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Пользователь не авторизован',
  })
  async getUnreadCount(@CurrentUser() user: User) {
    return this.notificationsService.getUnreadCount(user.id);
  }

  @Patch(':id/read')
  @ApiOperation({
    summary: 'Отметить уведомление как прочитанное',
    description: 'Помечает указанное уведомление как прочитанное',
  })
  @ApiParam({
    name: 'id',
    description: 'ID уведомления',
    example: 42,
    type: Number,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Уведомление отмечено как прочитанное',
    type: NotificationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Пользователь не авторизован',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Уведомление не найдено',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Это не ваше уведомление',
  })
  async markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ): Promise<NotificationResponseDto> {
    return this.notificationsService.markAsRead(id, user.id);
  }

  @Patch('read-all')
  @ApiOperation({
    summary: 'Отметить все уведомления как прочитанные',
    description: 'Помечает все непрочитанные уведомления пользователя как прочитанные',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Все уведомления отмечены как прочитанные',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Все уведомления отмечены как прочитанные' },
        count: { type: 'number', example: 10 },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Пользователь не авторизован',
  })
  async markAllAsRead(@CurrentUser() user: User) {
    return this.notificationsService.markAllAsRead(user.id);
  }
}
