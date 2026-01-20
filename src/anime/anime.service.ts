import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AnimeSortField, GetAnimeDto, SortOrder } from './dto/get-anime.dto';
import { PaginatedAnimeResponseDto } from './dto/paginated-anime-response.dto';


@Injectable()
export class AnimeService {
  constructor(private prisma: PrismaService) {}

  async findAll(dto: GetAnimeDto): Promise<PaginatedAnimeResponseDto> {
    const { page = 1, limit = 20, search, sort_by, sort_order, year_from, year_to, status, genre, rating_from, rating_to } = dto;

    if (page < 1) {
      throw new BadRequestException('Номер страницы должен быть больше 0');
    }

    if (limit < 1 || limit > 100) {
      throw new BadRequestException('Размер страницы должен быть от 1 до 100');
    }

    const skip = (page - 1) * limit;

    const where: Prisma.AnimeWhereInput = {};
    let countWhere: Prisma.AnimeWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { title_orig: { contains: search } },
        { other_title: { contains: search } },
      ];
      countWhere.OR = [
        { title: { contains: search } },
        { title_orig: { contains: search } },
        { other_title: { contains: search } },
      ];
    }

    if (year_from || year_to) {
      where.year = {};
      countWhere.year = {};
      if (year_from) {
        where.year.gte = year_from;
        countWhere.year.gte = year_from;
      }
      if (year_to) {
        where.year.lte = year_to;
        countWhere.year.lte = year_to;
      }
    }

    if (rating_from || rating_to) {
      where.shikimori_rating = {};
      countWhere.shikimori_rating = {};
      if (rating_from) {
        where.shikimori_rating.gte = rating_from;
        countWhere.shikimori_rating.gte = rating_from;
      }
      if (rating_to) {
        where.shikimori_rating.lte = rating_to;
        countWhere.shikimori_rating.lte = rating_to;
      }
    }

    if (status) {
      if (status === 'unknown') {
        where.all_status = null;
        countWhere.all_status = null;
      } else {
        where.all_status = status;
        countWhere.all_status = status;
      }
    }

    if (genre) {
      where.anime_genres = {
        some: {
          genre: {
            name: { contains: genre }
          }
        }
      };
      countWhere.anime_genres = {
        some: {
          genre: {
            name: { contains: genre }
          }
        }
      };
    }

    const orderBy: Prisma.AnimeOrderByWithRelationInput = {};
    orderBy[sort_by || AnimeSortField.TITLE] = sort_order || SortOrder.ASC;

    const total = await this.prisma.anime.count({ where: countWhere });

    const anime = await this.prisma.anime.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        anime_genres: {
          select: {
            genre: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        },
        anime_translations: {
          select: {
            id: true,
            title: true,
            trans_type: true,
          }
        },
        anime_screenshots: {
          select: {
            id: true,
            url: true,
          },
          take: 5
        },
        anime_persons: {
          select: {
            person: {
              select: {
                id: true,
                name: true,
              }
            },
            role: true,
          }
        },
        anime_studios: {
          select: {
            studio: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        },
        blocked_countries: {
          select: {
            id: true,
            country: true,
          }
        }
      }
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: anime,
      pagination: {
        page,
        limit,
        total,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1,
      }
    };
  }

  async findById(id: number) {
    return this.prisma.anime.findUnique({
      where: { id },
      include: {
        anime_genres: {
          select: {
            genre: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        },
        anime_translations: {
          select: {
            id: true,
            title: true,
            trans_type: true,
          }
        },
        anime_screenshots: {
          select: {
            id: true,
            url: true,
          },
          take: 5
        },
        anime_persons: {
          select: {
            person: {
              select: {
                id: true,
                name: true,
              }
            },
            role: true,
          }
        },
        anime_studios: {
          select: {
            studio: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        },
        blocked_countries: {
          select: {
            id: true,
            country: true,
          }
        }
      }
    });
  }

  async findByKodikId(kodikId: string) {
    return this.prisma.anime.findUnique({
      where: { kodik_id: kodikId },
      include: {
        anime_genres: {
          select: {
            genre: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        },
        anime_translations: {
          select: {
            id: true,
            title: true,
            trans_type: true,
          }
        },
        anime_screenshots: {
          select: {
            id: true,
            url: true,
          },
          take: 5
        },
        anime_persons: {
          select: {
            person: {
              select: {
                id: true,
                name: true,
              }
            },
            role: true,
          }
        },
        anime_studios: {
          select: {
            studio: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        }
      }
    });
  }

  async getGenres() {
    return this.prisma.genre.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            anime_genres: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
  }

  async getStats() {
    const totalAnime = await this.prisma.anime.count();
    const ongoingAnime = await this.prisma.anime.count({
      where: { all_status: 'ongoing' }
    });
    const completedAnime = await this.prisma.anime.count({
      where: { all_status: 'released' }
    });

    const avgRating = await this.prisma.anime.aggregate({
      where: { shikimori_rating: { not: null } },
      _avg: { shikimori_rating: true }
    });

    const yearStats = await this.prisma.anime.groupBy({
      by: ['year'],
      where: { year: { not: null } },
      _count: { id: true },
      orderBy: { year: 'desc' }
    });

    return {
      total: totalAnime,
      ongoing: ongoingAnime,
      completed: completedAnime,
      average_rating: avgRating._avg.shikimori_rating || 0,
      years_distribution: yearStats.map(stat => ({
        year: stat.year,
        count: stat._count.id
      }))
    };
  }
}
