-- AlterTable
ALTER TABLE "SavingsGoal" ADD COLUMN     "budgetId" TEXT,
ALTER COLUMN "icon" DROP NOT NULL,
ALTER COLUMN "title" DROP NOT NULL;

-- AlterTable
ALTER TABLE "SavingsTopUp" ADD COLUMN     "budgetId" TEXT;

-- AddForeignKey
ALTER TABLE "SavingsGoal" ADD CONSTRAINT "SavingsGoal_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavingsTopUp" ADD CONSTRAINT "SavingsTopUp_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget"("id") ON DELETE SET NULL ON UPDATE CASCADE;
