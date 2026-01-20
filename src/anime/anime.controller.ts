import { Controller, Get, HttpStatus, Param, ParseIntPipe, Query, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AnimeService } from './anime.service';
import { AnimeResponseDto } from './dto/anime-response.dto';
import { GenreResponseDto } from './dto/genre-response.dto';
import { GetAnimeDto } from './dto/get-anime.dto';
import { PaginatedAnimeResponseDto } from './dto/paginated-anime-response.dto';
import { StatsResponseDto } from './dto/stats-response.dto';

@ApiTags('Anime')
@Controller('anime')
export class AnimeController {
  constructor(private readonly animeService: AnimeService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Получить список аниме с фильтрацией и пагинацией',
    description: 'Возвращает список аниме с поддержкой поиска, фильтрации по году, статусу, жанру и сортировки'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Список аниме успешно получен',
    type: PaginatedAnimeResponseDto
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Некорректные параметры запроса (неверная страница или лимит)'
  })
  async getAllAnime(@Query(new ValidationPipe({ transform: true })) dto: GetAnimeDto): Promise<PaginatedAnimeResponseDto> {
    return this.animeService.findAll(dto);
  }

  @Get('stats')
  @ApiOperation({ 
    summary: 'Получить статистику по аниме',
    description: 'Возвращает общую статистику: количество аниме, онгоингов, завершенных, средний рейтинг и распределение по годам'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Статистика успешно получена',
    type: StatsResponseDto
  })
  async getAnimeStats() {
    return this.animeService.getStats();
  }

  @Get('genres')
  @ApiOperation({ 
    summary: 'Получить список всех жанров',
    description: 'Возвращает список всех доступных жанров с количеством аниме в каждом жанре'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Список жанров успешно получен',
    type: [GenreResponseDto]
  })
  async getGenres() {
    return this.animeService.getGenres();
  }

  @Get('kodik/:kodikId')
  @ApiOperation({ 
    summary: 'Получить аниме по Kodik ID',
    description: 'Возвращает полную информацию об аниме по его уникальному идентификатору из базы Kodik'
  })
  @ApiParam({
    name: 'kodikId',
    description: 'Уникальный идентификатор аниме в базе Kodik',
    example: 'anime-12345-abcdef',
    type: String
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Аниме успешно найдено',
    type: AnimeResponseDto
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Аниме с указанным Kodik ID не найдено'
  })
  async getAnimeByKodikId(@Param('kodikId') kodikId: string) {
    return this.animeService.findByKodikId(kodikId);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Получить аниме по ID',
    description: 'Возвращает полную информацию об аниме по его внутреннему числовому идентификатору'
  })
  @ApiParam({
    name: 'id',
    description: 'Внутренний числовой идентификатор аниме',
    example: 42,
    type: Number
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Аниме успешно найдено',
    type: AnimeResponseDto
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Аниме с указанным ID не найдено'
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Некорректный формат ID (должно быть целое число)'
  })
  async getAnimeById(@Param('id', ParseIntPipe) id: number) {
    return this.animeService.findById(id);
  }
}
