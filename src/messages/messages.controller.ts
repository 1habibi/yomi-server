import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MessageStatus } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateMessageDto, EditMessageDto } from './dto/create-message.dto';
import { GetMessagesDto } from './dto/get-messages.dto';
import {
  MessageResponseDto,
  PaginatedConversationsResponseDto,
  PaginatedMessagesResponseDto
} from './dto/message-response.dto';
import { MessagesGateway } from './messages.gateway';
import { MessagesService } from './messages.service';

@ApiTags('Messages')
@Controller('messages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly messagesGateway: MessagesGateway,
  ) {}

  @Get('conversations')
  @ApiOperation({ summary: 'Получить все диалоги' })
  @ApiResponse({
    status: 200,
    description: 'Список диалогов',
    type: PaginatedConversationsResponseDto,
  })
  async getConversations(
    @CurrentUser('id') userId: string,
    @Query() dto: GetMessagesDto,
  ): Promise<PaginatedConversationsResponseDto> {
    return this.messagesService.getConversations(userId, dto);
  }

  @Post('conversations/:userId')
  @ApiOperation({ summary: 'Начать диалог с пользователем' })
  @ApiParam({ name: 'userId', description: 'ID пользователя' })
  @ApiResponse({
    status: 201,
    description: 'Диалог создан или получен',
    schema: { properties: { id: { type: 'number', example: 1 } } },
  })
  @ApiResponse({ status: 403, description: 'Переписка запрещена настройками приватности' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  async createConversation(
    @CurrentUser('id') userId: string,
    @Param('userId') targetUserId: string,
  ): Promise<{ id: number }> {
    return this.messagesService.getOrCreateConversation(userId, targetUserId);
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Получить сообщения диалога' })
  @ApiParam({ name: 'id', description: 'ID диалога' })
  @ApiResponse({
    status: 200,
    description: 'Список сообщений',
    type: PaginatedMessagesResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Нет доступа к диалогу' })
  @ApiResponse({ status: 404, description: 'Диалог не найден' })
  async getMessages(
    @CurrentUser('id') userId: string,
    @Param('id', ParseIntPipe) conversationId: number,
    @Query() dto: GetMessagesDto,
  ): Promise<PaginatedMessagesResponseDto> {
    return this.messagesService.getMessages(userId, conversationId, dto);
  }

  @Post('conversations/:id/messages')
  @ApiOperation({ summary: 'Отправить сообщение' })
  @ApiParam({ name: 'id', description: 'ID диалога' })
  @ApiResponse({
    status: 201,
    description: 'Сообщение отправлено',
    type: MessageResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Нет доступа к диалогу' })
  @ApiResponse({ status: 404, description: 'Диалог не найден' })
  async sendMessage(
    @CurrentUser('id') userId: string,
    @Param('id', ParseIntPipe) conversationId: number,
    @Body() dto: CreateMessageDto,
  ): Promise<MessageResponseDto> {
    const message = await this.messagesService.sendMessage(
      userId,
      conversationId,
      dto,
    );

    this.messagesGateway.sendNewMessage(conversationId, message);

    return message;
  }

  @Patch(':messageId')
  @ApiOperation({ summary: 'Редактировать сообщение' })
  @ApiParam({ name: 'messageId', description: 'ID сообщения' })
  @ApiResponse({
    status: 200,
    description: 'Сообщение отредактировано',
    type: MessageResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Нельзя редактировать чужие сообщения' })
  @ApiResponse({ status: 404, description: 'Сообщение не найдено' })
  async editMessage(
    @CurrentUser('id') userId: string,
    @Param('messageId', ParseIntPipe) messageId: number,
    @Body() dto: EditMessageDto,
  ): Promise<MessageResponseDto> {
    const message = await this.messagesService.editMessage(
      userId,
      messageId,
      dto,
    );

    this.messagesGateway.sendMessageEdited(message.conversation_id, message);

    return message;
  }

  @Delete(':messageId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Удалить сообщение' })
  @ApiParam({ name: 'messageId', description: 'ID сообщения' })
  @ApiResponse({ status: 200, description: 'Сообщение удалено' })
  @ApiResponse({ status: 403, description: 'Нельзя удалять чужие сообщения' })
  @ApiResponse({ status: 404, description: 'Сообщение не найдено' })
  async deleteMessage(
    @CurrentUser('id') userId: string,
    @Param('messageId', ParseIntPipe) messageId: number,
  ): Promise<{ message: string }> {
    const result = await this.messagesService.deleteMessage(userId, messageId);

    const msg = await this.messagesService['prisma'].message.findUnique({
      where: { id: messageId },
      select: { conversation_id: true },
    });

    if (msg) {
      this.messagesGateway.sendMessageDeleted(msg.conversation_id, messageId);
    }

    return result;
  }

  @Post('conversations/:id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Отметить сообщения диалога как прочитанные' })
  @ApiParam({ name: 'id', description: 'ID диалога' })
  @ApiResponse({ status: 200, description: 'Сообщения отмечены как прочитанные' })
  @ApiResponse({ status: 403, description: 'Нет доступа к диалогу' })
  @ApiResponse({ status: 404, description: 'Диалог не найден' })
  async markAsRead(
    @CurrentUser('id') userId: string,
    @Param('id', ParseIntPipe) conversationId: number,
  ): Promise<{ message: string }> {
    const result = await this.messagesService.markAsRead(
      userId,
      conversationId,
    );

    this.messagesGateway.sendMessageStatus(
      conversationId,
      0,
      MessageStatus.READ,
      new Date(),
    );

    return result;
  }
}
