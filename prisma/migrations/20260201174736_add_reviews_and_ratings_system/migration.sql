-- AlterTable
ALTER TABLE `notifications` MODIFY `type` ENUM('COMMENT_REPLY', 'COMMENT_LIKE', 'REVIEW_APPROVED', 'REVIEW_REJECTED') NOT NULL;

-- CreateTable
CREATE TABLE `user_anime_ratings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(191) NOT NULL,
    `anime_id` INTEGER NOT NULL,
    `rating` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `user_anime_ratings_user_id_idx`(`user_id`),
    INDEX `user_anime_ratings_anime_id_idx`(`anime_id`),
    INDEX `user_anime_ratings_rating_idx`(`rating`),
    UNIQUE INDEX `user_anime_ratings_user_id_anime_id_key`(`user_id`, `anime_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reviews` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(191) NOT NULL,
    `anime_id` INTEGER NOT NULL,
    `content` TEXT NOT NULL,
    `overall_rating` INTEGER NOT NULL,
    `story_rating` INTEGER NULL,
    `animation_rating` INTEGER NULL,
    `music_rating` INTEGER NULL,
    `characters_rating` INTEGER NULL,
    `voice_acting_rating` INTEGER NULL,
    `has_spoilers` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `rejection_reason` TEXT NULL,
    `moderated_by` VARCHAR(191) NULL,
    `moderated_at` DATETIME(3) NULL,
    `likes_count` INTEGER NOT NULL DEFAULT 0,
    `dislikes_count` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `reviews_anime_id_status_idx`(`anime_id`, `status`),
    INDEX `reviews_user_id_idx`(`user_id`),
    INDEX `reviews_status_idx`(`status`),
    INDEX `reviews_overall_rating_idx`(`overall_rating`),
    INDEX `reviews_created_at_idx`(`created_at`),
    UNIQUE INDEX `reviews_user_id_anime_id_key`(`user_id`, `anime_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `review_likes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `review_id` INTEGER NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `is_like` BOOLEAN NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `review_likes_review_id_idx`(`review_id`),
    UNIQUE INDEX `review_likes_review_id_user_id_key`(`review_id`, `user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_anime_ratings` ADD CONSTRAINT `user_anime_ratings_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_anime_ratings` ADD CONSTRAINT `user_anime_ratings_anime_id_fkey` FOREIGN KEY (`anime_id`) REFERENCES `anime`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_anime_id_fkey` FOREIGN KEY (`anime_id`) REFERENCES `anime`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_moderated_by_fkey` FOREIGN KEY (`moderated_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `review_likes` ADD CONSTRAINT `review_likes_review_id_fkey` FOREIGN KEY (`review_id`) REFERENCES `reviews`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `review_likes` ADD CONSTRAINT `review_likes_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
