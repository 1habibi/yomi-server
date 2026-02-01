import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InteractionType, UserAnimeList } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UserSettingsService } from '../user-settings/user-settings.service';
import { AddToListDto } from './dto/add-to-list.dto';
import { ReorderListDto } from './dto/reorder-list.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { UserAnimeResponseDto } from './dto/user-anime-response.dto';
import { UserListsResponseDto } from './dto/user-lists-response.dto';

interface UserAnimeStats {
  total: number;
  watching: number;
  watched: number;
  planned: number;
  dropped: number;
  favorite: number;
  recommended: number;
  disliked: number;
  average_rating?: number;
}

@Injectable()
export class UserAnimeService {
  constructor(
    private prisma: PrismaService,
    private userSettingsService: UserSettingsService,
  ) {}

  private static readonly PRIMARY_STATUSES: InteractionType[] = [
    InteractionType.WATCHING,
    InteractionType.WATCHED,
    InteractionType.PLANNED,
    InteractionType.DROPPED,
  ];

  private static readonly ANIME_SELECT = {
    id: true,
    title: true,
    title_orig: true,
    poster_url: true,
    anime_poster_url: true,
    year: true,
    episodes_total: true,
    shikimori_rating: true,
  } as const;

  async addToList(userId: string, dto: AddToListDto): Promise<UserAnimeResponseDto> {
    const anime = await this.prisma.anime.findUnique({
      where: { id: dto.anime_id },
    });

    if (!anime) {
      throw new NotFoundException(`Аниме с ID ${dto.anime_id} не найдено`);
    }

    const existingLists = await this.prisma.userAnimeList.findMany({
      where: { user_id: userId, anime_id: dto.anime_id },
    });

    this.validateListConflicts(dto.list_type, existingLists);

    if (UserAnimeService.PRIMARY_STATUSES.includes(dto.list_type)) {
      await this.prisma.userAnimeList.deleteMany({
        where: {
          user_id: userId,
          anime_id: dto.anime_id,
          list_type: { in: UserAnimeService.PRIMARY_STATUSES },
        },
      });
    }

    const maxOrder = await this.getMaxOrder(userId, dto.list_type);

    await this.prisma.userAnimeList.create({
      data: {
        user_id: userId,
        anime_id: dto.anime_id,
        list_type: dto.list_type,
        rating: dto.rating,
        order: maxOrder + 1,
      },
    });

    const status = await this.getAnimeStatus(userId, dto.anime_id);
    if (!status) {
      throw new Error('Не удалось получить статус аниме после создания');
    }
    return status;
  }

  async removeFromList(
    userId: string,
    animeId: number,
    listType: InteractionType,
  ): Promise<void> {
    const deleted = await this.prisma.userAnimeList.deleteMany({
      where: {
        user_id: userId,
        anime_id: animeId,
        list_type: listType,
      },
    });

    if (deleted.count === 0) {
      throw new NotFoundException(
        `Аниме с ID ${animeId} не найдено в списке "${listType}"`,
      );
    }
  }

  async removeFromAllLists(userId: string, animeId: number): Promise<void> {
    const deleted = await this.prisma.userAnimeList.deleteMany({
      where: {
        user_id: userId,
        anime_id: animeId,
      },
    });

    if (deleted.count === 0) {
      throw new NotFoundException(`Аниме с ID ${animeId} не найдено в ваших списках`);
    }
  }

  async updateRating(
    userId: string,
    animeId: number,
    dto: UpdateRatingDto,
  ): Promise<UserAnimeResponseDto> {
    const lists = await this.prisma.userAnimeList.findMany({
      where: { user_id: userId, anime_id: animeId },
    });

    if (lists.length === 0) {
      throw new NotFoundException(`Аниме с ID ${animeId} не найдено в ваших списках`);
    }

    await this.prisma.userAnimeList.updateMany({
      where: {
        user_id: userId,
        anime_id: animeId,
      },
      data: {
        rating: dto.rating,
      },
    });

    const status = await this.getAnimeStatus(userId, animeId);
    if (!status) {
      throw new Error('Не удалось получить статус аниме после обновления рейтинга');
    }
    return status;
  }

  async reorderList(userId: string, dto: ReorderListDto): Promise<void> {
    const lists = await this.prisma.userAnimeList.findMany({
      where: {
        user_id: userId,
        anime_id: { in: dto.anime_ids },
        list_type: dto.list_type,
      },
    });

    if (lists.length !== dto.anime_ids.length) {
      throw new BadRequestException(
        'Некоторые аниме не найдены в вашем списке',
      );
    }

    await this.prisma.$transaction(
      dto.anime_ids.map((animeId, index) =>
        this.prisma.userAnimeList.updateMany({
          where: {
            user_id: userId,
            anime_id: animeId,
            list_type: dto.list_type,
          },
          data: { order: index },
        }),
      ),
    );
  }

  async getAnimeStatus(
    userId: string,
    animeId: number,
  ): Promise<UserAnimeResponseDto | null> {
    const lists = await this.prisma.userAnimeList.findMany({
      where: { user_id: userId, anime_id: animeId },
      include: {
        anime: {
          select: UserAnimeService.ANIME_SELECT,
        },
      },
      orderBy: { updated_at: 'desc' },
    });

    if (lists.length === 0) {
      return null;
    }

    const firstList = lists[0];

    return {
      id: firstList.id,
      anime: firstList.anime,
      list_types: lists.map((l) => l.list_type),
      rating: firstList.rating,
      added_at: firstList.added_at,
      updated_at: firstList.updated_at,
    };
  }

  async getMyLists(
    userId: string,
    sortBy: 'date' | 'rating' | 'title' | 'custom' = 'custom',
  ): Promise<UserListsResponseDto> {
    const allLists = await this.prisma.userAnimeList.findMany({
      where: { user_id: userId },
      include: {
        anime: {
          select: UserAnimeService.ANIME_SELECT,
        },
      },
      orderBy: this.getOrderBy(sortBy),
    });

    const animeList = this.groupAnimeByListTypes(allLists);

    const response: UserListsResponseDto = {
      watching: animeList.filter((a) => a.list_types.includes(InteractionType.WATCHING)),
      watched: animeList.filter((a) => a.list_types.includes(InteractionType.WATCHED)),
      planned: animeList.filter((a) => a.list_types.includes(InteractionType.PLANNED)),
      dropped: animeList.filter((a) => a.list_types.includes(InteractionType.DROPPED)),
      favorite: animeList.filter((a) => a.list_types.includes(InteractionType.FAVORITE)),
      recommended: animeList.filter((a) => a.list_types.includes(InteractionType.RECOMMENDED)),
      disliked: animeList.filter((a) => a.list_types.includes(InteractionType.DISLIKED)),
      stats: await this.getStats(userId, animeList),
    };

    return response;
  }

  async getListByType(
    userId: string,
    listType: InteractionType,
    sortBy: 'date' | 'rating' | 'title' | 'custom' = 'custom',
  ): Promise<UserAnimeResponseDto[]> {
    const lists = await this.prisma.userAnimeList.findMany({
      where: { user_id: userId, list_type: listType },
      include: {
        anime: {
          select: UserAnimeService.ANIME_SELECT,
        },
      },
      orderBy: this.getOrderBy(sortBy),
    });

    const animeIds = lists.map((l) => l.anime_id);
    const allListsForAnime = await this.prisma.userAnimeList.findMany({
      where: {
        user_id: userId,
        anime_id: { in: animeIds },
      },
    });

    const listTypesMap = this.buildListTypesMap(allListsForAnime);

    return lists.map((list) => ({
      id: list.id,
      anime: list.anime,
      list_types: listTypesMap.get(list.anime_id) || [list.list_type],
      rating: list.rating,
      added_at: list.added_at,
      updated_at: list.updated_at,
    }));
  }

  private validateListConflicts(
    newListType: InteractionType,
    existingLists: UserAnimeList[],
  ): void {
    const existingTypes = existingLists.map((l) => l.list_type);
    if (
      newListType === InteractionType.FAVORITE &&
      existingTypes.includes(InteractionType.DISLIKED)
    ) {
      throw new BadRequestException(
        'Нельзя добавить в "Любимое" аниме, которое в списке "Ненавижу"',
      );
    }

    if (
      newListType === InteractionType.DISLIKED &&
      existingTypes.includes(InteractionType.FAVORITE)
    ) {
      throw new BadRequestException(
        'Нельзя добавить в "Ненавижу" аниме, которое в "Любимых"',
      );
    }

    if (existingTypes.includes(newListType)) {
      throw new BadRequestException(
        `Аниме уже находится в списке "${this.getListName(newListType)}"`,
      );
    }
  }

  private async getMaxOrder(
    userId: string,
    listType: InteractionType,
  ): Promise<number> {
    const result = await this.prisma.userAnimeList.aggregate({
      where: { user_id: userId, list_type: listType },
      _max: { order: true },
    });

    return result._max.order ?? -1;
  }

  private getOrderBy(sortBy: 'date' | 'rating' | 'title' | 'custom') {
    switch (sortBy) {
      case 'date':
        return { added_at: 'desc' as const };
      case 'rating':
        return { rating: 'desc' as const };
      case 'title':
        return { anime: { title: 'asc' as const } };
      case 'custom':
      default:
        return { order: 'asc' as const };
    }
  }

  private groupAnimeByListTypes(lists: any[]): UserAnimeResponseDto[] {
    const animeMap = new Map<number, UserAnimeResponseDto>();

    for (const list of lists) {
      if (!animeMap.has(list.anime_id)) {
        animeMap.set(list.anime_id, {
          id: list.id,
          anime: list.anime,
          list_types: [],
          rating: list.rating,
          added_at: list.added_at,
          updated_at: list.updated_at,
        });
      }

      animeMap.get(list.anime_id)!.list_types.push(list.list_type);
    }

    return Array.from(animeMap.values());
  }

  private buildListTypesMap(lists: UserAnimeList[]): Map<number, InteractionType[]> {
    const listTypesMap = new Map<number, InteractionType[]>();

    for (const list of lists) {
      if (!listTypesMap.has(list.anime_id)) {
        listTypesMap.set(list.anime_id, []);
      }
      listTypesMap.get(list.anime_id)!.push(list.list_type);
    }

    return listTypesMap;
  }

  private async getStats(
    userId: string,
    animeList: UserAnimeResponseDto[],
  ): Promise<UserAnimeStats> {
    const stats: UserAnimeStats = {
      total: animeList.length,
      watching: animeList.filter((a) => a.list_types.includes(InteractionType.WATCHING)).length,
      watched: animeList.filter((a) => a.list_types.includes(InteractionType.WATCHED)).length,
      planned: animeList.filter((a) => a.list_types.includes(InteractionType.PLANNED)).length,
      dropped: animeList.filter((a) => a.list_types.includes(InteractionType.DROPPED)).length,
      favorite: animeList.filter((a) => a.list_types.includes(InteractionType.FAVORITE)).length,
      recommended: animeList.filter((a) => a.list_types.includes(InteractionType.RECOMMENDED)).length,
      disliked: animeList.filter((a) => a.list_types.includes(InteractionType.DISLIKED)).length,
    };

    const ratingsSum = animeList.reduce((sum, a) => sum + (a.rating || 0), 0);
    const ratingsCount = animeList.filter((a) => a.rating !== null).length;

    if (ratingsCount > 0) {
      stats.average_rating = parseFloat((ratingsSum / ratingsCount).toFixed(2));
    }

    return stats;
  }

  private getListName(listType: InteractionType): string {
    const names = {
      [InteractionType.WATCHING]: 'Смотрю',
      [InteractionType.WATCHED]: 'Просмотрено',
      [InteractionType.PLANNED]: 'В планах',
      [InteractionType.DROPPED]: 'Заброшено',
      [InteractionType.FAVORITE]: 'Любимое',
      [InteractionType.RECOMMENDED]: 'Рекомендую',
      [InteractionType.DISLIKED]: 'Ненавижу',
    };
    return names[listType] || listType;
  }

  async getUserLists(
    targetUserId: string,
    requestingUserId?: string,
    sortBy: 'date' | 'rating' | 'title' | 'custom' = 'custom',
  ): Promise<UserListsResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    if (requestingUserId === targetUserId) {
      return this.getMyLists(targetUserId, sortBy);
    }

    const areListsPublic = await this.userSettingsService.areListsPublic(targetUserId);

    if (!areListsPublic) {
      throw new ForbiddenException('Списки этого пользователя приватные');
    }

    const areRatingsPublic = await this.userSettingsService.areRatingsPublic(targetUserId);

    const lists = await this.getMyLists(targetUserId, sortBy);

    if (!areRatingsPublic) {
      const hideRatings = (animeList: UserAnimeResponseDto[]) =>
        animeList.map((anime) => ({ ...anime, rating: undefined }));

      lists.watching = hideRatings(lists.watching);
      lists.watched = hideRatings(lists.watched);
      lists.planned = hideRatings(lists.planned);
      lists.dropped = hideRatings(lists.dropped);
      lists.favorite = hideRatings(lists.favorite);
      lists.recommended = hideRatings(lists.recommended);
      lists.disliked = hideRatings(lists.disliked);
      lists.stats.average_rating = undefined;
    }

    return lists;
  }
}
