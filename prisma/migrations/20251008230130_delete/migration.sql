-- DropForeignKey
ALTER TABLE "ActivityLog" DROP CONSTRAINT "ActivityLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "Budget" DROP CONSTRAINT "Budget_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Budget" DROP CONSTRAINT "Budget_userId_fkey";

-- DropForeignKey
ALTER TABLE "Content" DROP CONSTRAINT "Content_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Content" DROP CONSTRAINT "Content_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_userId_fkey";

-- DropForeignKey
ALTER TABLE "FcmToken" DROP CONSTRAINT "FcmToken_userId_fkey";

-- DropForeignKey
ALTER TABLE "FinanceSetup" DROP CONSTRAINT "FinanceSetup_currencyId_fkey";

-- DropForeignKey
ALTER TABLE "FinanceSetup" DROP CONSTRAINT "FinanceSetup_userId_fkey";

-- DropForeignKey
ALTER TABLE "Goal" DROP CONSTRAINT "Goal_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Income" DROP CONSTRAINT "Income_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Income" DROP CONSTRAINT "Income_userId_fkey";

-- DropForeignKey
ALTER TABLE "Module1" DROP CONSTRAINT "Module1_userId_fkey";

-- DropForeignKey
ALTER TABLE "Module2" DROP CONSTRAINT "Module2_userId_fkey";

-- DropForeignKey
ALTER TABLE "Module3" DROP CONSTRAINT "Module3_userId_fkey";

-- DropForeignKey
ALTER TABLE "Note" DROP CONSTRAINT "Note_userId_fkey";

-- DropForeignKey
ALTER TABLE "Otp" DROP CONSTRAINT "Otp_userId_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_userId_fkey";

-- DropForeignKey
ALTER TABLE "RecurringIncome" DROP CONSTRAINT "RecurringIncome_currencyId_fkey";

-- DropForeignKey
ALTER TABLE "RecurringIncome" DROP CONSTRAINT "RecurringIncome_userId_fkey";

-- DropForeignKey
ALTER TABLE "RecurringIncome" DROP CONSTRAINT "RecurringIncome_walletId_fkey";

-- DropForeignKey
ALTER TABLE "SavingsGoal" DROP CONSTRAINT "SavingsGoal_userId_fkey";

-- DropForeignKey
ALTER TABLE "SavingsTopUp" DROP CONSTRAINT "SavingsTopUp_savingsGoalId_fkey";

-- DropForeignKey
ALTER TABLE "SavingsTopUp" DROP CONSTRAINT "SavingsTopUp_userId_fkey";

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserAssessment" DROP CONSTRAINT "UserAssessment_assessmentId_fkey";

-- DropForeignKey
ALTER TABLE "UserAssessment" DROP CONSTRAINT "UserAssessment_userId_fkey";

-- DropForeignKey
ALTER TABLE "Wallet" DROP CONSTRAINT "Wallet_userId_fkey";

-- AlterTable
ALTER TABLE "ActivityLog" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Budget" ALTER COLUMN "userId" DROP NOT NULL,
ALTER COLUMN "categoryId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Content" ALTER COLUMN "categoryId" DROP NOT NULL,
ALTER COLUMN "authorId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Expense" ALTER COLUMN "userId" DROP NOT NULL,
ALTER COLUMN "categoryId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "FinanceSetup" ALTER COLUMN "userId" DROP NOT NULL,
ALTER COLUMN "currencyId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Goal" ALTER COLUMN "projectId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Income" ALTER COLUMN "userId" DROP NOT NULL,
ALTER COLUMN "categoryId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Module1" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Module2" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Module3" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Note" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "categoryId" DROP NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "RecurringIncome" ALTER COLUMN "userId" DROP NOT NULL,
ALTER COLUMN "walletId" DROP NOT NULL,
ALTER COLUMN "currencyId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "SavingsGoal" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "SavingsTopUp" ALTER COLUMN "savingsGoalId" DROP NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Ticket" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "UserAssessment" ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "FcmToken" ADD CONSTRAINT "FcmToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Otp" ADD CONSTRAINT "Otp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavingsGoal" ADD CONSTRAINT "SavingsGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Income" ADD CONSTRAINT "Income_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Income" ADD CONSTRAINT "Income_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringIncome" ADD CONSTRAINT "RecurringIncome_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringIncome" ADD CONSTRAINT "RecurringIncome_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringIncome" ADD CONSTRAINT "RecurringIncome_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAssessment" ADD CONSTRAINT "UserAssessment_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAssessment" ADD CONSTRAINT "UserAssessment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavingsTopUp" ADD CONSTRAINT "SavingsTopUp_savingsGoalId_fkey" FOREIGN KEY ("savingsGoalId") REFERENCES "SavingsGoal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavingsTopUp" ADD CONSTRAINT "SavingsTopUp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Module1" ADD CONSTRAINT "Module1_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Module2" ADD CONSTRAINT "Module2_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Module3" ADD CONSTRAINT "Module3_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceSetup" ADD CONSTRAINT "FinanceSetup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceSetup" ADD CONSTRAINT "FinanceSetup_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE SET NULL ON UPDATE CASCADE;
