/*
  Warnings:

  - You are about to drop the column `date` on the `Goal` table. All the data in the column will be lost.
  - You are about to drop the column `time` on the `Goal` table. All the data in the column will be lost.
  - You are about to drop the column `amount` on the `SavingsGoal` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Expense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `Goal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Goal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Income` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectColor` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `monthlyIncome` to the `SavingsGoal` table without a default value. This is not possible if the table is not empty.
  - Made the column `targetAmount` on table `SavingsGoal` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "budgetId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Goal" DROP COLUMN "date",
DROP COLUMN "time",
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "endTime" TEXT,
ADD COLUMN     "isCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startTime" TEXT;

-- AlterTable
ALTER TABLE "Income" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "projectColor" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SavingsGoal" DROP COLUMN "amount",
ADD COLUMN     "monthlyIncome" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "targetAmount" SET NOT NULL;

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_userId_key" ON "Wallet"("userId");

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget"("id") ON DELETE SET NULL ON UPDATE CASCADE;
