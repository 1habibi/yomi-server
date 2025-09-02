/*
  Warnings:

  - A unique constraint covering the columns `[userId,userAgent]` on the table `refresh_tokens` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "refresh_tokens" ADD COLUMN     "userAgent" TEXT NOT NULL DEFAULT 'Unknown';

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_userId_userAgent_key" ON "refresh_tokens"("userId", "userAgent");
