import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AnimeSortField, GetAnimeDto, SortOrder } from './dto/get-anime.dto';

export interface PaginatedAnimeResponse {
  data: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

@Injectable()
export class AnimeService {
  constructor(private prisma: PrismaService) {}

  async findAll(dto: GetAnimeDto): Promise<PaginatedAnimeResponse> {
    const { page = 1, limit = 20, search, sort_by, sort_order, year_from, year_to, only_ongoing, only_completed, genre } = dto;

    if (page < 1) {
      throw new BadRequestException('Номер страницы должен быть больше 0');
    }

    if (limit < 1 || limit > 100) {
      throw new BadRequestException('Размер страницы должен быть от 1 до 100');
    }

    const skip = (page - 1) * limit;

    const where: any = {};
    let countWhere: any = {};

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

    if (only_ongoing) {
      where.all_status = 'ongoing';
      countWhere.all_status = 'ongoing';
    }

    if (only_completed) {
      where.all_status = 'released';
      countWhere.all_status = 'released';
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

    const orderBy: any = {};
    orderBy[sort_by || AnimeSortField.TITLE] = sort_order || SortOrder.ASC;

    const total = await this.prisma.anime.count({ where: countWhere });

    const anime = await this.prisma.anime.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: {
        id: true,
        kodik_id: true,
        title: true,
        title_orig: true,
        year: true,
        all_status: true,
        anime_kind: true,
        episodes_count: true,
        duration: true,
        shikimori_rating: true,
        poster_url: true,
        anime_poster_url: true,
        description: true,
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
          },
          take: 3
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
      select: {
        id: true,
        kodik_id: true,
        kodik_type: true,
        link: true,
        title: true,
        title_orig: true,
        other_title: true,
        year: true,
        last_season: true,
        last_episode: true,
        episodes_count: true,
        kinopoisk_id: true,
        imdb_id: true,
        shikimori_id: true,
        quality: true,
        camrip: true,
        lgbt: true,
        created_at: true,
        updated_at: true,
        description: true,
        anime_description: true,
        poster_url: true,
        anime_poster_url: true,
        premiere_world: true,
        aired_at: true,
        released_at: true,
        rating_mpaa: true,
        minimal_age: true,
        episodes_total: true,
        episodes_aired: true,
        imdb_rating: true,
        imdb_votes: true,
        shikimori_rating: true,
        shikimori_votes: true,
        next_episode_at: true,
        all_status: true,
        anime_kind: true,
        duration: true,
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

  async findByKodikId(kodikId: string) {
    return this.prisma.anime.findUnique({
      where: { kodik_id: kodikId },
      select: {
        id: true,
        kodik_id: true,
        kodik_type: true,
        link: true,
        title: true,
        title_orig: true,
        other_title: true,
        year: true,
        last_season: true,
        last_episode: true,
        episodes_count: true,
        kinopoisk_id: true,
        imdb_id: true,
        shikimori_id: true,
        quality: true,
        camrip: true,
        lgbt: true,
        created_at: true,
        updated_at: true,
        description: true,
        anime_description: true,
        poster_url: true,
        anime_poster_url: true,
        premiere_world: true,
        aired_at: true,
        released_at: true,
        rating_mpaa: true,
        minimal_age: true,
        episodes_total: true,
        episodes_aired: true,
        imdb_rating: true,
        imdb_votes: true,
        shikimori_rating: true,
        shikimori_votes: true,
        next_episode_at: true,
        all_status: true,
        anime_kind: true,
        duration: true,
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
