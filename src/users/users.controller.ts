import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role, User } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserResponseDto } from './dto/user-response.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ChangeEmailDto } from './dto/change-email.dto';
import { MessageResponseDto } from './dto/message-response.dto';
import { UsersService } from './users.service';
import { UploadService } from '../upload/upload.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly uploadService: UploadService,
  ) {}

  @ApiOperation({ summary: 'Получить список всех пользователей' })
  @ApiResponse({ status: 200, description: 'Список пользователей успешно получен', type: [UserResponseDto] })
  @ApiResponse({ status: 401, description: 'Неавторизованный доступ' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен' })
  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  async getAllUsers() {
    return this.usersService.findAll();
  }

  
  @Get('me')
  @ApiOperation({ summary: 'Получить информацию о текущем пользователе' })
  @ApiResponse({
    status: 200,
    description: 'Информация о пользователе успешно получена',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Неавторизованный доступ' })
  async getCurrentUser(@CurrentUser() user: User): Promise<UserResponseDto> {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatar_url,
      isEmailConfirmed: user.is_email_confirmed,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }

  @Post('me/change-password')
  @ApiOperation({ summary: 'Изменить пароль' })
  @ApiResponse({
    status: 200,
    description: 'Пароль успешно изменен',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Некорректные данные',
  })
  @ApiResponse({
    status: 401,
    description: 'Неверный текущий пароль',
  })
  async changePassword(
    @CurrentUser() user: User,
    @Body() dto: ChangePasswordDto,
  ): Promise<MessageResponseDto> {
    return this.usersService.changePassword(user.id, dto);
  }

  @Post('me/change-email')
  @ApiOperation({ summary: 'Изменить email' })
  @ApiResponse({
    status: 200,
    description: 'Email успешно изменен. Требуется подтверждение.',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Некорректные данные',
  })
  @ApiResponse({
    status: 401,
    description: 'Неверный пароль',
  })
  @ApiResponse({
    status: 409,
    description: 'Пользователь с таким email уже существует',
  })
  async changeEmail(
    @CurrentUser() user: User,
    @Body() dto: ChangeEmailDto,
  ): Promise<MessageResponseDto> {
    return this.usersService.changeEmail(user.id, dto);
  }

  @Post('me/avatar')
  @ApiOperation({
    summary: 'Загрузить аватар',
    description:
      'Загружает изображение аватара пользователя. Поддерживаемые форматы: JPG, PNG, WEBP. Максимальный размер: 5MB.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Файл изображения (JPG, PNG, WEBP)',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Аватар успешно загружен',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Файл не был загружен или некорректный формат',
  })
  @ApiResponse({
    status: 401,
    description: 'Неавторизованный доступ',
  })
  @ApiResponse({
    status: 413,
    description: 'Размер файла превышает допустимый (5MB)',
  })
  @ApiResponse({
    status: 500,
    description: 'Ошибка загрузки файла в хранилище',
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UserResponseDto> {
    if (!file) {
      throw new BadRequestException('Файл не был загружен');
    }

    // Загрузить в S3 и получить URL
    const avatarUrl = await this.uploadService.uploadToS3(file.buffer, user.id);

    // Сохранить URL в БД
    return this.usersService.updateAvatar(user.id, avatarUrl);
  }

  @Delete('me/avatar')
  @ApiOperation({
    summary: 'Удалить аватар',
    description: 'Удаляет текущий аватар пользователя',
  })
  @ApiResponse({
    status: 200,
    description: 'Аватар успешно удален',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Неавторизованный доступ',
  })
  async deleteAvatar(@CurrentUser() user: User): Promise<UserResponseDto> {
    return this.usersService.deleteAvatar(user.id);
  }
}
