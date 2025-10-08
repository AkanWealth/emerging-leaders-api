/*
  Warnings:

  - You are about to drop the column `userId` on the `Notification` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropIndex
DROP INDEX "Notification_userId_idx";

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "userId",
ADD COLUMN     "receiverId" TEXT,
ADD COLUMN     "senderId" TEXT;

-- CreateIndex
CREATE INDEX "Notification_senderId_idx" ON "Notification"("senderId");

-- CreateIndex
CREATE INDEX "Notification_receiverId_idx" ON "Notification"("receiverId");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
