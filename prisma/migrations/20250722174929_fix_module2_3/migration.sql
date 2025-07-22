/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Module2` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `Module3` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Module2` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Module3` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Module2" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Module3" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Module2_userId_key" ON "Module2"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Module3_userId_key" ON "Module3"("userId");
