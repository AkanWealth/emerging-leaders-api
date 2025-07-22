/*
  Warnings:

  - You are about to drop the column `workbookId` on the `Module1` table. All the data in the column will be lost.
  - You are about to drop the column `workbookId` on the `Module2` table. All the data in the column will be lost.
  - You are about to drop the column `workbookId` on the `Module3` table. All the data in the column will be lost.
  - You are about to drop the `Workbook` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Module1" DROP CONSTRAINT "Module1_workbookId_fkey";

-- DropForeignKey
ALTER TABLE "Module2" DROP CONSTRAINT "Module2_workbookId_fkey";

-- DropForeignKey
ALTER TABLE "Module3" DROP CONSTRAINT "Module3_workbookId_fkey";

-- DropIndex
DROP INDEX "Module1_workbookId_userId_key";

-- DropIndex
DROP INDEX "Module2_workbookId_userId_key";

-- DropIndex
DROP INDEX "Module3_workbookId_userId_key";

-- AlterTable
ALTER TABLE "Module1" DROP COLUMN "workbookId";

-- AlterTable
ALTER TABLE "Module2" DROP COLUMN "workbookId";

-- AlterTable
ALTER TABLE "Module3" DROP COLUMN "workbookId";

-- DropTable
DROP TABLE "Workbook";
