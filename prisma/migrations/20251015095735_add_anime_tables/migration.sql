-- CreateTable
CREATE TABLE `anime` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kodik_id` VARCHAR(191) NOT NULL,
    `kodik_type` VARCHAR(191) NULL,
    `link` VARCHAR(191) NULL,
    `title` VARCHAR(191) NULL,
    `title_orig` VARCHAR(191) NULL,
    `other_title` VARCHAR(191) NULL,
    `year` INTEGER NULL,
    `last_season` INTEGER NULL,
    `last_episode` INTEGER NULL,
    `episodes_count` INTEGER NULL,
    `kinopoisk_id` VARCHAR(191) NULL,
    `imdb_id` VARCHAR(191) NULL,
    `shikimori_id` VARCHAR(191) NULL,
    `quality` VARCHAR(191) NULL,
    `camrip` BOOLEAN NULL DEFAULT false,
    `lgbt` BOOLEAN NULL DEFAULT false,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,
    `description` VARCHAR(191) NULL,
    `anime_description` VARCHAR(191) NULL,
    `poster_url` VARCHAR(191) NULL,
    `anime_poster_url` VARCHAR(191) NULL,
    `premiere_world` DATE NULL,
    `aired_at` DATE NULL,
    `released_at` DATE NULL,
    `rating_mpaa` VARCHAR(191) NULL,
    `minimal_age` INTEGER NULL,
    `episodes_total` INTEGER NULL,
    `episodes_aired` INTEGER NULL,
    `imdb_rating` DOUBLE NULL,
    `imdb_votes` INTEGER NULL,
    `shikimori_rating` DOUBLE NULL,
    `shikimori_votes` DOUBLE NULL,
    `next_episode_at` DATETIME(3) NULL,
    `all_status` VARCHAR(191) NULL,
    `anime_kind` VARCHAR(191) NULL,
    `duration` INTEGER NULL,

    UNIQUE INDEX `anime_kodik_id_key`(`kodik_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `translations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `anime_id` INTEGER NULL,
    `external_id` INTEGER NULL,
    `title` VARCHAR(191) NULL,
    `trans_type` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `genres` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `genres_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `anime_genres` (
    `anime_id` INTEGER NOT NULL,
    `genre_id` INTEGER NOT NULL,

    PRIMARY KEY (`anime_id`, `genre_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `screenshots` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `anime_id` INTEGER NULL,
    `url` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `persons` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `persons_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `anime_persons` (
    `anime_id` INTEGER NOT NULL,
    `person_id` INTEGER NOT NULL,
    `role` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`anime_id`, `person_id`, `role`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `studios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `studios_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `anime_studios` (
    `anime_id` INTEGER NOT NULL,
    `studio_id` INTEGER NOT NULL,

    PRIMARY KEY (`anime_id`, `studio_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blocked_countries` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `anime_id` INTEGER NULL,
    `country` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blocked_seasons` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `anime_id` INTEGER NULL,
    `season` VARCHAR(191) NULL,
    `blocked_data` JSON NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_anime` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` VARCHAR(191) NOT NULL,
    `animeId` INTEGER NOT NULL,
    `rating` INTEGER NULL,
    `interaction` ENUM('WATCHED', 'PLANNED', 'WATCHING', 'DROPPED', 'FAVORITE', 'RECOMMENDED', 'DISLIKED') NOT NULL,
    `liked` BOOLEAN NULL DEFAULT false,
    `interactedAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `user_anime_userId_animeId_key`(`userId`, `animeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `refresh_tokens` ADD CONSTRAINT `refresh_tokens_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `translations` ADD CONSTRAINT `translations_anime_id_fkey` FOREIGN KEY (`anime_id`) REFERENCES `anime`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `anime_genres` ADD CONSTRAINT `anime_genres_anime_id_fkey` FOREIGN KEY (`anime_id`) REFERENCES `anime`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `anime_genres` ADD CONSTRAINT `anime_genres_genre_id_fkey` FOREIGN KEY (`genre_id`) REFERENCES `genres`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `screenshots` ADD CONSTRAINT `screenshots_anime_id_fkey` FOREIGN KEY (`anime_id`) REFERENCES `anime`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `anime_persons` ADD CONSTRAINT `anime_persons_anime_id_fkey` FOREIGN KEY (`anime_id`) REFERENCES `anime`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `anime_persons` ADD CONSTRAINT `anime_persons_person_id_fkey` FOREIGN KEY (`person_id`) REFERENCES `persons`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `anime_studios` ADD CONSTRAINT `anime_studios_anime_id_fkey` FOREIGN KEY (`anime_id`) REFERENCES `anime`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `anime_studios` ADD CONSTRAINT `anime_studios_studio_id_fkey` FOREIGN KEY (`studio_id`) REFERENCES `studios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blocked_countries` ADD CONSTRAINT `blocked_countries_anime_id_fkey` FOREIGN KEY (`anime_id`) REFERENCES `anime`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blocked_seasons` ADD CONSTRAINT `blocked_seasons_anime_id_fkey` FOREIGN KEY (`anime_id`) REFERENCES `anime`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_anime` ADD CONSTRAINT `user_anime_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_anime` ADD CONSTRAINT `user_anime_animeId_fkey` FOREIGN KEY (`animeId`) REFERENCES `anime`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
