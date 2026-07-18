import {
  Controller,
  Post,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CharacterSearchService } from './character-search.service';
import {
  SearchResponseDto,
  MultiSearchResponseDto,
} from './dto/character-search.dto';

@ApiTags('Character Search')
@Controller('character-search')
export class CharacterSearchController {
  constructor(private readonly characterSearchService: CharacterSearchService) {}

  @Post('search')
  @ApiOperation({ summary: 'Поиск персонажа по изображению' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Изображение (JPG, PNG, WEBP)',
        },
      },
      required: ['file'],
    },
  })
  @ApiQuery({
    name: 'top_k',
    required: false,
    type: Number,
    description: 'Количество результатов (1-100)',
  })
  @ApiQuery({
    name: 'anime_context',
    required: false,
    type: String,
    description: 'Название текущего аниме для фильтрации результатов (из плеера)',
  })
  @ApiResponse({ status: 200, type: SearchResponseDto })
  @ApiResponse({ status: 400, description: 'Неверный формат или размер файла' })
  @ApiResponse({ status: 503, description: 'AI-сервис недоступен' })
  @UseInterceptors(FileInterceptor('file'))
  async search(
    @UploadedFile() file: Express.Multer.File,
    @Query('top_k') topK?: string,
    @Query('anime_context') animeContext?: string,
  ) {
    if (!file) {
      throw new BadRequestException('Файл не был загружен');
    }
    this.validateImageFile(file);

    const result = await this.characterSearchService.searchSingle(
      file.buffer,
      file.originalname,
      file.mimetype,
      topK ? Number(topK) : 20,
    );

    if (animeContext) {
      return this.characterSearchService.filterByAnimeContext(result, animeContext);
    }

    return result;
  }

  @Post('search-multi')
  @ApiOperation({ summary: 'Поиск нескольких персонажей на изображении' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Изображение (JPG, PNG, WEBP)',
        },
      },
      required: ['file'],
    },
  })
  @ApiQuery({ name: 'min_face_confidence', required: false, type: Number })
  @ApiQuery({ name: 'top_k_per_face', required: false, type: Number })
  @ApiResponse({ status: 200, type: MultiSearchResponseDto })
  @ApiResponse({ status: 400, description: 'Неверный формат или размер файла' })
  @ApiResponse({ status: 503, description: 'AI-сервис недоступен' })
  @UseInterceptors(FileInterceptor('file'))
  async searchMulti(
    @UploadedFile() file: Express.Multer.File,
    @Query('min_face_confidence') minFaceConfidence?: string,
    @Query('top_k_per_face') topKPerFace?: string,
  ) {
    if (!file) {
      throw new BadRequestException('Файл не был загружен');
    }
    this.validateImageFile(file);

    return this.characterSearchService.searchMulti(
      file.buffer,
      file.originalname,
      file.mimetype,
      minFaceConfidence ? Number(minFaceConfidence) : 0.5,
      topKPerFace ? Number(topKPerFace) : 3,
    );
  }

  private validateImageFile(file: Express.Multer.File) {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Недопустимый формат файла: ${file.mimetype}. Разрешены: JPG, PNG, WEBP`,
      );
    }
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException('Файл слишком большой. Максимальный размер: 10MB');
    }
  }
}
