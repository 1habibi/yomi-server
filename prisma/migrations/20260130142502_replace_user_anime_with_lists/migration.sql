/*
  Warnings:

  - You are about to drop the `user_anime` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `user_anime` DROP FOREIGN KEY `user_anime_anime_id_fkey`;

-- DropForeignKey
ALTER TABLE `user_anime` DROP FOREIGN KEY `user_anime_user_id_fkey`;

-- DropTable
DROP TABLE `user_anime`;

-- CreateTable
CREATE TABLE `user_anime_lists` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(191) NOT NULL,
    `anime_id` INTEGER NOT NULL,
    `list_type` ENUM('WATCHED', 'PLANNED', 'WATCHING', 'DROPPED', 'FAVORITE', 'RECOMMENDED', 'DISLIKED') NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `rating` INTEGER NULL,
    `added_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `user_anime_lists_user_id_list_type_order_idx`(`user_id`, `list_type`, `order`),
    INDEX `user_anime_lists_user_id_anime_id_idx`(`user_id`, `anime_id`),
    UNIQUE INDEX `user_anime_lists_user_id_anime_id_list_type_key`(`user_id`, `anime_id`, `list_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_settings` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `lists_are_public` BOOLEAN NOT NULL DEFAULT true,
    `show_ratings_publicly` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_settings_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_anime_lists` ADD CONSTRAINT `user_anime_lists_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_anime_lists` ADD CONSTRAINT `user_anime_lists_anime_id_fkey` FOREIGN KEY (`anime_id`) REFERENCES `anime`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_settings` ADD CONSTRAINT `user_settings_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
