import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Patch,
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
import { UpdateUserSettingsDto } from './dto/update-user-settings.dto';
import { UserSettingsResponseDto } from './dto/user-settings-response.dto';
import { UserSettingsService } from './user-settings.service';

@ApiTags('User Settings')
@Controller('user-settings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserSettingsController {
  constructor(private readonly userSettingsService: UserSettingsService) {}

  @Get()
  @ApiOperation({
    summary: 'Получить настройки пользователя',
    description:
      'Возвращает настройки приватности списков и оценок. Если настройки не существуют - создает с значениями по умолчанию.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Настройки успешно получены',
    type: UserSettingsResponseDto,
  })
  async getSettings(
    @CurrentUser() user: User,
  ): Promise<UserSettingsResponseDto> {
    return this.userSettingsService.getSettings(user.id);
  }

  @Patch()
  @ApiOperation({
    summary: 'Обновить настройки пользователя',
    description:
      'Обновляет настройки приватности списков и оценок. Можно обновлять отдельные поля.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Настройки успешно обновлены',
    type: UserSettingsResponseDto,
  })
  async updateSettings(
    @CurrentUser() user: User,
    @Body(new ValidationPipe({ transform: true })) dto: UpdateUserSettingsDto,
  ): Promise<UserSettingsResponseDto> {
    return this.userSettingsService.updateSettings(user.id, dto);
  }
}
