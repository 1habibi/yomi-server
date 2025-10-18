/*
  Warnings:

  - You are about to drop the column `createdAt` on the `refresh_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `refresh_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `userAgent` on the `refresh_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `refresh_tokens` table. All the data in the column will be lost.
  - You are about to drop the column `animeId` on the `user_anime` table. All the data in the column will be lost.
  - You are about to drop the column `interactedAt` on the `user_anime` table. All the data in the column will be lost.
  - You are about to drop the column `liked` on the `user_anime` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `user_anime` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `emailConfirmToken` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `isEmailConfirmed` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `resetPasswordExpires` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `resetPasswordToken` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id,user_agent]` on the table `refresh_tokens` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,anime_id]` on the table `user_anime` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `expires_at` to the `refresh_tokens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `refresh_tokens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `anime_id` to the `user_anime` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `user_anime` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `refresh_tokens` DROP FOREIGN KEY `refresh_tokens_userId_fkey`;

-- DropForeignKey
ALTER TABLE `user_anime` DROP FOREIGN KEY `user_anime_animeId_fkey`;

-- DropForeignKey
ALTER TABLE `user_anime` DROP FOREIGN KEY `user_anime_userId_fkey`;

-- DropIndex
DROP INDEX `refresh_tokens_userId_userAgent_key` ON `refresh_tokens`;

-- DropIndex
DROP INDEX `user_anime_animeId_fkey` ON `user_anime`;

-- DropIndex
DROP INDEX `user_anime_userId_animeId_key` ON `user_anime`;

-- AlterTable
ALTER TABLE `refresh_tokens` DROP COLUMN `createdAt`,
    DROP COLUMN `expiresAt`,
    DROP COLUMN `userAgent`,
    DROP COLUMN `userId`,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `expires_at` DATETIME(3) NOT NULL,
    ADD COLUMN `user_agent` VARCHAR(191) NOT NULL DEFAULT 'Unknown',
    ADD COLUMN `user_id` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `user_anime` DROP COLUMN `animeId`,
    DROP COLUMN `interactedAt`,
    DROP COLUMN `liked`,
    DROP COLUMN `userId`,
    ADD COLUMN `anime_id` INTEGER NOT NULL,
    ADD COLUMN `interacted_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `user_id` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `createdAt`,
    DROP COLUMN `emailConfirmToken`,
    DROP COLUMN `isEmailConfirmed`,
    DROP COLUMN `resetPasswordExpires`,
    DROP COLUMN `resetPasswordToken`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `email_confirm_token` VARCHAR(191) NULL,
    ADD COLUMN `is_email_confirmed` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `reset_password_expires` DATETIME(3) NULL,
    ADD COLUMN `reset_password_token` VARCHAR(191) NULL,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `refresh_tokens_user_id_user_agent_key` ON `refresh_tokens`(`user_id`, `user_agent`);

-- CreateIndex
CREATE UNIQUE INDEX `user_anime_user_id_anime_id_key` ON `user_anime`(`user_id`, `anime_id`);

-- AddForeignKey
ALTER TABLE `refresh_tokens` ADD CONSTRAINT `refresh_tokens_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_anime` ADD CONSTRAINT `user_anime_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_anime` ADD CONSTRAINT `user_anime_anime_id_fkey` FOREIGN KEY (`anime_id`) REFERENCES `anime`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
