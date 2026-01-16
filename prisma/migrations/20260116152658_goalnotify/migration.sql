-- CreateTable
CREATE TABLE "GoalNotification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "goalId" TEXT,
    "projectId" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GoalNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GoalNotification_userId_idx" ON "GoalNotification"("userId");

-- CreateIndex
CREATE INDEX "GoalNotification_goalId_idx" ON "GoalNotification"("goalId");

-- CreateIndex
CREATE INDEX "GoalNotification_projectId_idx" ON "GoalNotification"("projectId");

-- AddForeignKey
ALTER TABLE "GoalNotification" ADD CONSTRAINT "GoalNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoalNotification" ADD CONSTRAINT "GoalNotification_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoalNotification" ADD CONSTRAINT "GoalNotification_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
