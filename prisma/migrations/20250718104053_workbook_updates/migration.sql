/*
  Warnings:

  - A unique constraint covering the columns `[workbookId,userId]` on the table `Module1` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Module1` table without a default value. This is not possible if the table is not empty.
  - Made the column `userId` on table `Module1` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Module1" DROP CONSTRAINT "Module1_userId_fkey";

-- DropIndex
DROP INDEX "Module1_workbookId_key";

-- AlterTable
ALTER TABLE "Module1" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "userId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Module1_workbookId_userId_key" ON "Module1"("workbookId", "userId");

-- AddForeignKey
ALTER TABLE "Module1" ADD CONSTRAINT "Module1_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
