-- AlterTable
ALTER TABLE `refresh_tokens` ADD COLUMN `ip_address` VARCHAR(191) NULL,
    ADD COLUMN `last_activity` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
