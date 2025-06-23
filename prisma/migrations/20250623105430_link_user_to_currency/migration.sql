/*
  Warnings:

  - You are about to drop the column `currencyCode` on the `Currency` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code]` on the table `Currency` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `Currency` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Currency_currencyCode_key";

-- AlterTable
ALTER TABLE "Currency" DROP COLUMN "currencyCode",
ADD COLUMN     "code" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "currencyId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Currency_code_key" ON "Currency"("code");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE SET NULL ON UPDATE CASCADE;
