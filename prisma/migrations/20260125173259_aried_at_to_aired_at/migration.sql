/*
  Warnings:

  - You are about to drop the column `aried_at` on the `anime` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `anime` DROP COLUMN `aried_at`,
    ADD COLUMN `aired_at` DATE NULL;
