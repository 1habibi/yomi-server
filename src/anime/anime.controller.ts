import { Controller, Get, Param, Query, ParseIntPipe, ValidationPipe } from '@nestjs/common';
import { AnimeService } from './anime.service';
import { GetAnimeDto } from './dto/get-anime.dto';

@Controller('anime')
export class AnimeController {
  constructor(private readonly animeService: AnimeService) {}

  @Get()
  async getAllAnime(@Query(new ValidationPipe({ transform: true })) dto: GetAnimeDto) {
    return this.animeService.findAll(dto);
  }

  @Get('stats')
  async getAnimeStats() {
    return this.animeService.getStats();
  }

  @Get('genres')
  async getGenres() {
    return this.animeService.getGenres();
  }

  @Get(':id')
  async getAnimeById(@Param('id', ParseIntPipe) id: number) {
    return this.animeService.findById(id);
  }

  @Get('kodik/:kodikId')
  async getAnimeByKodikId(@Param('kodikId') kodikId: string) {
    return this.animeService.findByKodikId(kodikId);
  }
}
