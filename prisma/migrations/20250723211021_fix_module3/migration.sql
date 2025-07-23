/*
  Warnings:

  - Added the required column `oneYearFromNow` to the `Module3` table without a default value. This is not possible if the table is not empty.
  - Added the required column `week1Cashflow` to the `Module3` table without a default value. This is not possible if the table is not empty.
  - Added the required column `week1Expenses` to the `Module3` table without a default value. This is not possible if the table is not empty.
  - Added the required column `week1Income` to the `Module3` table without a default value. This is not possible if the table is not empty.
  - Added the required column `week1ProfitLoss` to the `Module3` table without a default value. This is not possible if the table is not empty.
  - Added the required column `week1Total` to the `Module3` table without a default value. This is not possible if the table is not empty.
  - Added the required column `week2Cashflow` to the `Module3` table without a default value. This is not possible if the table is not empty.
  - Added the required column `week2Expenses` to the `Module3` table without a default value. This is not possible if the table is not empty.
  - Added the required column `week2Income` to the `Module3` table without a default value. This is not possible if the table is not empty.
  - Added the required column `week2ProfitLoss` to the `Module3` table without a default value. This is not possible if the table is not empty.
  - Added the required column `week2Total` to the `Module3` table without a default value. This is not possible if the table is not empty.
  - Added the required column `week3Cashflow` to the `Module3` table without a default value. This is not possible if the table is not empty.
  - Added the required column `week3Expenses` to the `Module3` table without a default value. This is not possible if the table is not empty.
  - Added the required column `week3Income` to the `Module3` table without a default value. This is not possible if the table is not empty.
  - Added the required column `week3ProfitLoss` to the `Module3` table without a default value. This is not possible if the table is not empty.
  - Added the required column `week3Total` to the `Module3` table without a default value. This is not possible if the table is not empty.
  - Added the required column `week4Cashflow` to the `Module3` table without a default value. This is not possible if the table is not empty.
  - Added the required column `week4Expenses` to the `Module3` table without a default value. This is not possible if the table is not empty.
  - Added the required column `week4Income` to the `Module3` table without a default value. This is not possible if the table is not empty.
  - Added the required column `week4ProfitLoss` to the `Module3` table without a default value. This is not possible if the table is not empty.
  - Added the required column `week4Total` to the `Module3` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Module3" ADD COLUMN     "oneYearFromNow" TEXT NOT NULL,
ADD COLUMN     "week1Cashflow" TEXT NOT NULL,
ADD COLUMN     "week1Expenses" TEXT NOT NULL,
ADD COLUMN     "week1Income" TEXT NOT NULL,
ADD COLUMN     "week1ProfitLoss" TEXT NOT NULL,
ADD COLUMN     "week1Total" TEXT NOT NULL,
ADD COLUMN     "week2Cashflow" TEXT NOT NULL,
ADD COLUMN     "week2Expenses" TEXT NOT NULL,
ADD COLUMN     "week2Income" TEXT NOT NULL,
ADD COLUMN     "week2ProfitLoss" TEXT NOT NULL,
ADD COLUMN     "week2Total" TEXT NOT NULL,
ADD COLUMN     "week3Cashflow" TEXT NOT NULL,
ADD COLUMN     "week3Expenses" TEXT NOT NULL,
ADD COLUMN     "week3Income" TEXT NOT NULL,
ADD COLUMN     "week3ProfitLoss" TEXT NOT NULL,
ADD COLUMN     "week3Total" TEXT NOT NULL,
ADD COLUMN     "week4Cashflow" TEXT NOT NULL,
ADD COLUMN     "week4Expenses" TEXT NOT NULL,
ADD COLUMN     "week4Income" TEXT NOT NULL,
ADD COLUMN     "week4ProfitLoss" TEXT NOT NULL,
ADD COLUMN     "week4Total" TEXT NOT NULL;
