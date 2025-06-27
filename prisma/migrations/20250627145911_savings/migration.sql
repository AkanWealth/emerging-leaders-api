/*
  Warnings:

  - You are about to drop the column `currency` on the `SavingsGoal` table. All the data in the column will be lost.
  - You are about to drop the column `goalIcon` on the `SavingsGoal` table. All the data in the column will be lost.
  - You are about to drop the column `goalTitle` on the `SavingsGoal` table. All the data in the column will be lost.
  - You are about to drop the column `hasSpecificGoal` on the `SavingsGoal` table. All the data in the column will be lost.
  - You are about to drop the column `monthlyIncome` on the `SavingsGoal` table. All the data in the column will be lost.
  - Added the required column `icon` to the `SavingsGoal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `SavingsGoal` table without a default value. This is not possible if the table is not empty.
  - Made the column `targetDate` on table `SavingsGoal` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "SavingsGoal" DROP COLUMN "currency",
DROP COLUMN "goalIcon",
DROP COLUMN "goalTitle",
DROP COLUMN "hasSpecificGoal",
DROP COLUMN "monthlyIncome",
ADD COLUMN     "icon" TEXT NOT NULL,
ADD COLUMN     "isCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "savedAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "title" TEXT NOT NULL,
ALTER COLUMN "targetDate" SET NOT NULL;

-- CreateTable
CREATE TABLE "SavingsTopUp" (
    "id" TEXT NOT NULL,
    "savingsGoalId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavingsTopUp_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SavingsTopUp" ADD CONSTRAINT "SavingsTopUp_savingsGoalId_fkey" FOREIGN KEY ("savingsGoalId") REFERENCES "SavingsGoal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavingsTopUp" ADD CONSTRAINT "SavingsTopUp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
