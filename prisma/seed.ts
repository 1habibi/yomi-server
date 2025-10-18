import { faker } from '@faker-js/faker';
import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

const USER_COUNT = 200;
const INTERACTIONS_PER_USER_MIN = 80;
const INTERACTIONS_PER_USER_MAX = 400;
const INTERACTION_TYPES = [
  'WATCHED',
  'PLANNED',
  'WATCHING',
  'FAVORITE',
  'DROPPED',
  'RECOMMENDED',
  'DISLIKED'
];

const RATING_MAP = {
  WATCHED: [7, 8, 9, 10],
  FAVORITE: [9, 10],
  WATCHING: [6, 7, 8],
  PLANNED: [5, 6, 7],
  RECOMMENDED: [8, 9, 10],
  DISLIKED: [1, 2, 3],
  DROPPED: [2, 3, 4, 5]
};

async function createTestUsers() {
  console.log('Создание тестовых пользователей...');

  const users: User[] = [];

  for (let i = 0; i < USER_COUNT; i++) {
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        password: faker.internet.password(),
        name: faker.person.fullName(),
        role: i < 5 ? 'ADMIN' : 'USER',
        is_email_confirmed: true,
      }
    });

    users.push(user);
    console.log(`Создан пользователь: ${user.name} (${user.email})`);
  }

  return users;
}

async function createUserAnimeInteractions(users: any[], animeIds: number[]) {
  console.log('Создание взаимодействий пользователей с аниме...');

  let totalInteractions = 0;

  for (const user of users) {
    const userPreferences = await generateUserPreferences();
    const userAnimeIds = await selectAnimeForUser(animeIds, userPreferences, INTERACTIONS_PER_USER_MIN, INTERACTIONS_PER_USER_MAX);

    for (const animeId of userAnimeIds) {
      const interactionType = selectInteractionType(userPreferences);
      const rating = selectRatingForInteraction(interactionType);

      try {
        await prisma.userAnime.create({
          data: {
            user_id: user.id,
            anime_id: animeId,
            interaction: interactionType,
            rating: rating,
            interacted_at: faker.date.past({ years: 2 })
          }
        });

        totalInteractions++;
      } catch (error) {
        if (!error.message.includes('Unique constraint')) {
          console.error(`Ошибка создания взаимодействия: ${error.message}`);
        }
      }
    }

    console.log(`Создано ${userAnimeIds.length} взаимодействий для пользователя ${user.name}`);
  }

  console.log(`Всего создано ${totalInteractions} взаимодействий`);
}

async function generateUserPreferences(): Promise<Record<string, number>> {
  const genres = await getGenresFromDB();

  if (genres.length === 0) {
    console.warn('В базе данных не найдены жанры');
    return {};
  }

  const preferences: Record<string, number> = {};

  const favoriteGenres = faker.helpers.arrayElements(genres, faker.number.int({ min: 2, max: 4 }));

  favoriteGenres.forEach(genre => {
    preferences[genre] = faker.number.int({ min: 7, max: 10 });
  });

  genres.forEach(genre => {
    if (!preferences[genre]) {
      preferences[genre] = faker.number.int({ min: 3, max: 7 });
    }
  });

  return preferences;
}

async function selectAnimeForUser(animeIds: number[], preferences: any, minCount: number, maxCount: number): Promise<number[]> {
  const interactionCount = faker.number.int({ min: minCount, max: maxCount });

  const animeGenres = await getAnimeGenres(animeIds);

  const weightedAnimeIds: number[] = [];

  animeIds.forEach(animeId => {
    const genres = animeGenres.get(animeId) || [];
    let weight = 1;

    if (genres.length > 0) {
      let totalPreference = 0;
      let genreMatches = 0;
      let favoriteGenreMatches = 0;

      genres.forEach(genre => {
        const preference = preferences[genre] || 5;
        totalPreference += preference;
        genreMatches++;

        if (preference >= 8) {
          favoriteGenreMatches++;
        }
      });

      if (genreMatches > 0) {
        const averagePreference = totalPreference / genreMatches;
        weight = Math.max(1, Math.min(5, Math.floor(averagePreference / 2)));

        const favoriteBonus = Math.min(2, favoriteGenreMatches);
        weight += favoriteBonus;

        const randomFactor = faker.number.int({ min: -1, max: 1 });
        weight = Math.max(1, Math.min(8, weight + randomFactor));
      }
    }

    for (let i = 0; i < weight; i++) {
      weightedAnimeIds.push(animeId);
    }
  });
  const selectedAnime = faker.helpers.arrayElements(weightedAnimeIds, interactionCount);

  return [...new Set(selectedAnime)];
}

function selectInteractionType(preferences: any) {
  const rand = Math.random();

  if (rand < 0.3) return 'WATCHED';
  if (rand < 0.45) return 'PLANNED';   
  if (rand < 0.55) return 'WATCHING';   
  if (rand < 0.65) return 'FAVORITE';   
  if (rand < 0.75) return 'RECOMMENDED';
  if (rand < 0.85) return 'DROPPED'; 
  return 'DISLIKED';
}

function selectRatingForInteraction(interactionType: string): number | null {
  const possibleRatings = RATING_MAP[interactionType] || [5];

  // Выбираем рейтинг на основе типа взаимодействия
  if (interactionType === 'FAVORITE' || interactionType === 'WATCHED') {
    return faker.helpers.arrayElement([9, 10]) as number; // Высокие рейтинги для любимых и просмотренных
  }

  return faker.helpers.arrayElement(possibleRatings) as number;
}

async function getAnimeGenres(animeIds: number[]): Promise<Map<number, string[]>> {
  try {
    const animeGenres = await prisma.anime_Genres.findMany({
      where: {
        anime_id: { in: animeIds }
      },
      include: {
        genre: true
      }
    });

    const genreMap = new Map<number, string[]>();

    animeGenres.forEach(ag => {
      if (!genreMap.has(ag.anime_id)) {
        genreMap.set(ag.anime_id, []);
      }
      if (ag.genre) {
        genreMap.get(ag.anime_id)!.push(ag.genre.name);
      }
    });

    return genreMap;
  } catch (error) {
    console.error('Ошибка получения жанров аниме:', error);
    return new Map();
  }
}

async function getGenresFromDB(): Promise<string[]> {
  try {
    const genres = await prisma.genre.findMany({
      select: { name: true }
    });

    return genres.map(genre => genre.name);
  } catch (error) {
    console.error('Ошибка получения жанров из БД:', error);
    return [];
  }
}

async function getAnimeIds() {
  try {
    const animes = await prisma.anime.findMany({
      select: { id: true }
    });

    return animes.map(anime => anime.id);
  } catch (error) {
    console.error('Ошибка получения ID аниме:', error);
    return [];
  }
}

async function main() {
  try {
    console.log('Начинаем генерацию seed данных...');

    const animeIds = await getAnimeIds();

    if (animeIds.length === 0) {
      console.error('Нет доступных аниме в базе данных. Сначала заполните таблицу Anime.');
      process.exit(1);
    }

    console.log(`Найдено ${animeIds.length} аниме в базе данных`);

    // Создаем пользователей
    const users = await createTestUsers();

    await createUserAnimeInteractions(users, animeIds);

    console.log('Seed данные успешно созданы!');
    console.log(`Статистика:`);
    console.log(`   • Пользователей: ${users.length}`);
    console.log(`   • Доступных аниме: ${animeIds.length}`);

  } catch (error) {
    console.error('Ошибка создания seed данных:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

export { main as createSeedData };
