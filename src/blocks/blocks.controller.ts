import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { BlocksService } from './blocks.service';
import { PaginatedBlocksResponseDto } from './dto/block-response.dto';
import { GetBlocksDto } from './dto/get-blocks.dto';

@ApiTags('Blocks')
@Controller('blocks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BlocksController {
  constructor(private readonly blocksService: BlocksService) {}

  @Post(':userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Заблокировать пользователя' })
  @ApiParam({ name: 'userId', description: 'ID пользователя' })
  @ApiResponse({ status: 200, description: 'Пользователь заблокирован' })
  @ApiResponse({ status: 400, description: 'Некорректный запрос или уже заблокирован' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  async blockUser(
    @CurrentUser('id') currentUserId: string,
    @Param('userId') userId: string,
  ): Promise<{ message: string }> {
    return this.blocksService.blockUser(currentUserId, userId);
  }

  @Delete(':userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Разблокировать пользователя' })
  @ApiParam({ name: 'userId', description: 'ID пользователя' })
  @ApiResponse({ status: 200, description: 'Пользователь разблокирован' })
  @ApiResponse({ status: 404, description: 'Блокировка не найдена' })
  async unblockUser(
    @CurrentUser('id') currentUserId: string,
    @Param('userId') userId: string,
  ): Promise<{ message: string }> {
    return this.blocksService.unblockUser(currentUserId, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список заблокированных пользователей' })
  @ApiResponse({
    status: 200,
    description: 'Список заблокированных',
    type: PaginatedBlocksResponseDto,
  })
  async getBlockedUsers(
    @CurrentUser('id') currentUserId: string,
    @Query() dto: GetBlocksDto,
  ): Promise<PaginatedBlocksResponseDto> {
    return this.blocksService.getBlockedUsers(currentUserId, dto);
  }
}
