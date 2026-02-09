-- CreateTable
CREATE TABLE `watch_sessions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(191) NOT NULL,
    `anime_id` INTEGER NOT NULL,
    `episode` INTEGER NULL,
    `season` INTEGER NULL,
    `translation_id` INTEGER NULL,
    `translation_title` VARCHAR(191) NULL,
    `duration_seconds` INTEGER NOT NULL,
    `watched_seconds` INTEGER NOT NULL,
    `max_position` INTEGER NOT NULL,
    `completion_ratio` DOUBLE NOT NULL,
    `started_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ended_at` DATETIME(3) NULL,
    `last_heartbeat` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `playback_speed` DOUBLE NOT NULL DEFAULT 1.0,
    `skipped_intro` BOOLEAN NOT NULL DEFAULT false,
    `skipped_outro` BOOLEAN NOT NULL DEFAULT false,
    `seek_count` INTEGER NOT NULL DEFAULT 0,
    `pause_count` INTEGER NOT NULL DEFAULT 0,

    INDEX `watch_sessions_user_id_anime_id_idx`(`user_id`, `anime_id`),
    INDEX `watch_sessions_user_id_started_at_idx`(`user_id`, `started_at`),
    INDEX `watch_sessions_anime_id_idx`(`anime_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `anime_page_views` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(191) NULL,
    `anime_id` INTEGER NOT NULL,
    `session_id` VARCHAR(191) NULL,
    `duration_ms` INTEGER NULL,
    `referrer` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `anime_page_views_user_id_anime_id_idx`(`user_id`, `anime_id`),
    INDEX `anime_page_views_user_id_created_at_idx`(`user_id`, `created_at`),
    INDEX `anime_page_views_anime_id_created_at_idx`(`anime_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `search_queries` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(191) NULL,
    `query` VARCHAR(500) NOT NULL,
    `results_count` INTEGER NOT NULL DEFAULT 0,
    `clicked_anime_id` INTEGER NULL,
    `session_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `search_queries_user_id_created_at_idx`(`user_id`, `created_at`),
    INDEX `search_queries_clicked_anime_id_idx`(`clicked_anime_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `watch_sessions` ADD CONSTRAINT `watch_sessions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `watch_sessions` ADD CONSTRAINT `watch_sessions_anime_id_fkey` FOREIGN KEY (`anime_id`) REFERENCES `anime`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `anime_page_views` ADD CONSTRAINT `anime_page_views_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `anime_page_views` ADD CONSTRAINT `anime_page_views_anime_id_fkey` FOREIGN KEY (`anime_id`) REFERENCES `anime`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `search_queries` ADD CONSTRAINT `search_queries_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `search_queries` ADD CONSTRAINT `search_queries_clicked_anime_id_fkey` FOREIGN KEY (`clicked_anime_id`) REFERENCES `anime`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
