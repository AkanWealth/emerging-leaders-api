-- AlterTable
ALTER TABLE "UserGoalProgress" ALTER COLUMN "lastMessageIdx" SET DEFAULT -1;

-- CreateTable
CREATE TABLE "UserProjectProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "lastMessageIdx" INTEGER NOT NULL DEFAULT -1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProjectProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProjectProgress_userId_projectId_key" ON "UserProjectProgress"("userId", "projectId");

-- AddForeignKey
ALTER TABLE "UserProjectProgress" ADD CONSTRAINT "UserProjectProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProjectProgress" ADD CONSTRAINT "UserProjectProgress_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
