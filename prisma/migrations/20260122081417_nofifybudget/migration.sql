-- CreateTable
CREATE TABLE "UserBudgetProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "savingsGoalId" TEXT,
    "budgetId" TEXT,
    "lastMessageIdx" INTEGER NOT NULL DEFAULT -1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserBudgetProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserBudgetProgress_userId_idx" ON "UserBudgetProgress"("userId");

-- CreateIndex
CREATE INDEX "UserBudgetProgress_savingsGoalId_idx" ON "UserBudgetProgress"("savingsGoalId");

-- CreateIndex
CREATE INDEX "UserBudgetProgress_budgetId_idx" ON "UserBudgetProgress"("budgetId");

-- AddForeignKey
ALTER TABLE "UserBudgetProgress" ADD CONSTRAINT "UserBudgetProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBudgetProgress" ADD CONSTRAINT "UserBudgetProgress_savingsGoalId_fkey" FOREIGN KEY ("savingsGoalId") REFERENCES "SavingsGoal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBudgetProgress" ADD CONSTRAINT "UserBudgetProgress_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget"("id") ON DELETE SET NULL ON UPDATE CASCADE;
