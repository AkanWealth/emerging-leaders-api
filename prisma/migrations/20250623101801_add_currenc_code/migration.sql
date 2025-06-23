/*
  Warnings:

  - You are about to drop the column `code` on the `Currency` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[currencyCode]` on the table `Currency` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `currencyCode` to the `Currency` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Currency_code_key";

-- AlterTable
ALTER TABLE "Currency" DROP COLUMN "code",
ADD COLUMN     "currencyCode" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Currency_currencyCode_key" ON "Currency"("currencyCode");
