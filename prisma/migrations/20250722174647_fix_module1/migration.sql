/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Module1` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Module1_userId_key" ON "Module1"("userId");
