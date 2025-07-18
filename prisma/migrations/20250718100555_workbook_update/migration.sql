/*
  Warnings:

  - A unique constraint covering the columns `[workbookId,userId]` on the table `Module2` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[workbookId,userId]` on the table `Module3` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Module2` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Module3` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Module2_workbookId_key";

-- DropIndex
DROP INDEX "Module3_workbookId_key";

-- AlterTable
ALTER TABLE "Module1" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "Module2" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Module3" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Module2_workbookId_userId_key" ON "Module2"("workbookId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Module3_workbookId_userId_key" ON "Module3"("workbookId", "userId");

-- AddForeignKey
ALTER TABLE "Module1" ADD CONSTRAINT "Module1_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Module2" ADD CONSTRAINT "Module2_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Module3" ADD CONSTRAINT "Module3_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
