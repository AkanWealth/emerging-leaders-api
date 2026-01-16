-- CreateTable
CREATE TABLE "BudgetNotification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT,
    "savingsGoalId" TEXT,
    "budgetId" TEXT,

    CONSTRAINT "BudgetNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BudgetNotification_userId_idx" ON "BudgetNotification"("userId");

-- CreateIndex
CREATE INDEX "BudgetNotification_budgetId_idx" ON "BudgetNotification"("budgetId");

-- CreateIndex
CREATE INDEX "BudgetNotification_savingsGoalId_idx" ON "BudgetNotification"("savingsGoalId");

-- AddForeignKey
ALTER TABLE "BudgetNotification" ADD CONSTRAINT "BudgetNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetNotification" ADD CONSTRAINT "BudgetNotification_savingsGoalId_fkey" FOREIGN KEY ("savingsGoalId") REFERENCES "SavingsGoal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetNotification" ADD CONSTRAINT "BudgetNotification_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget"("id") ON DELETE SET NULL ON UPDATE CASCADE;
