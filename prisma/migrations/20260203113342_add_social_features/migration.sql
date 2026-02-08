-- AlterTable
ALTER TABLE `notifications` MODIFY `type` ENUM('COMMENT_REPLY', 'COMMENT_LIKE', 'REVIEW_APPROVED', 'REVIEW_REJECTED', 'NEW_FOLLOWER', 'NEW_MESSAGE') NOT NULL;

-- AlterTable
ALTER TABLE `user_settings` ADD COLUMN `activity_visibility` ENUM('PUBLIC', 'FOLLOWERS_ONLY', 'PRIVATE') NOT NULL DEFAULT 'PUBLIC',
    ADD COLUMN `lists_visibility` ENUM('PUBLIC', 'FOLLOWERS_ONLY', 'PRIVATE') NOT NULL DEFAULT 'PUBLIC',
    ADD COLUMN `message_visibility` ENUM('EVERYONE', 'FOLLOWERS_ONLY', 'MUTUAL_ONLY') NOT NULL DEFAULT 'EVERYONE',
    ADD COLUMN `show_online_status` BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE `user_follows` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `follower_id` VARCHAR(191) NOT NULL,
    `following_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `user_follows_follower_id_idx`(`follower_id`),
    INDEX `user_follows_following_id_idx`(`following_id`),
    UNIQUE INDEX `user_follows_follower_id_following_id_key`(`follower_id`, `following_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_blocks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `blocker_id` VARCHAR(191) NOT NULL,
    `blocked_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `user_blocks_blocker_id_idx`(`blocker_id`),
    INDEX `user_blocks_blocked_id_idx`(`blocked_id`),
    UNIQUE INDEX `user_blocks_blocker_id_blocked_id_key`(`blocker_id`, `blocked_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_activities` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(191) NOT NULL,
    `type` ENUM('ANIME_ADDED_TO_LIST', 'ANIME_STATUS_CHANGED', 'ANIME_RATING_CHANGED', 'REVIEW_CREATED', 'COMMENT_CREATED') NOT NULL,
    `anime_id` INTEGER NULL,
    `review_id` INTEGER NULL,
    `comment_id` INTEGER NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `user_activities_user_id_created_at_idx`(`user_id`, `created_at`),
    INDEX `user_activities_anime_id_idx`(`anime_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `conversations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `participant_1` VARCHAR(191) NOT NULL,
    `participant_2` VARCHAR(191) NOT NULL,
    `last_message_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `conversations_participant_1_last_message_at_idx`(`participant_1`, `last_message_at`),
    INDEX `conversations_participant_2_last_message_at_idx`(`participant_2`, `last_message_at`),
    UNIQUE INDEX `conversations_participant_1_participant_2_key`(`participant_1`, `participant_2`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `messages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `conversation_id` INTEGER NOT NULL,
    `sender_id` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `image_url` VARCHAR(191) NULL,
    `status` ENUM('SENT', 'DELIVERED', 'READ') NOT NULL DEFAULT 'SENT',
    `delivered_at` DATETIME(3) NULL,
    `read_at` DATETIME(3) NULL,
    `is_edited` BOOLEAN NOT NULL DEFAULT false,
    `edited_at` DATETIME(3) NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `deleted_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `messages_conversation_id_created_at_idx`(`conversation_id`, `created_at`),
    INDEX `messages_sender_id_idx`(`sender_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_follows` ADD CONSTRAINT `user_follows_follower_id_fkey` FOREIGN KEY (`follower_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_follows` ADD CONSTRAINT `user_follows_following_id_fkey` FOREIGN KEY (`following_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_blocks` ADD CONSTRAINT `user_blocks_blocker_id_fkey` FOREIGN KEY (`blocker_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_blocks` ADD CONSTRAINT `user_blocks_blocked_id_fkey` FOREIGN KEY (`blocked_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_activities` ADD CONSTRAINT `user_activities_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_activities` ADD CONSTRAINT `user_activities_anime_id_fkey` FOREIGN KEY (`anime_id`) REFERENCES `anime`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversations` ADD CONSTRAINT `conversations_participant_1_fkey` FOREIGN KEY (`participant_1`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversations` ADD CONSTRAINT `conversations_participant_2_fkey` FOREIGN KEY (`participant_2`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_conversation_id_fkey` FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_sender_id_fkey` FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
