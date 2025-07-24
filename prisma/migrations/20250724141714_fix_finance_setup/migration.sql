/*
  Warnings:

  - You are about to drop the column `financeCompleted` on the `FinanceSetup` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FinanceSetup" DROP COLUMN "financeCompleted";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "financeCompleted" BOOLEAN NOT NULL DEFAULT false;
