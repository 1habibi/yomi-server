/*
  Warnings:

  - You are about to drop the `screenshots` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `translations` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `screenshots` DROP FOREIGN KEY `screenshots_anime_id_fkey`;

-- DropForeignKey
ALTER TABLE `translations` DROP FOREIGN KEY `translations_anime_id_fkey`;

-- DropTable
DROP TABLE `screenshots`;

-- DropTable
DROP TABLE `translations`;

-- CreateTable
CREATE TABLE `anime_translations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `anime_id` INTEGER NULL,
    `external_id` INTEGER NULL,
    `title` VARCHAR(191) NULL,
    `trans_type` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `anime_screenshots` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `anime_id` INTEGER NULL,
    `url` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `anime_translations` ADD CONSTRAINT `anime_translations_anime_id_fkey` FOREIGN KEY (`anime_id`) REFERENCES `anime`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `anime_screenshots` ADD CONSTRAINT `anime_screenshots_anime_id_fkey` FOREIGN KEY (`anime_id`) REFERENCES `anime`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
