import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BudgetNotificationCronService {
  private readonly logger = new Logger(BudgetNotificationCronService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Run every day at 8AM server time
   */
  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async handleDailyBudgetNotifications() {
    this.logger.log('Running daily budget notifications...');

    const users = await this.prisma.user.findMany({
      include: {
        wallet: true,
        budgets: {
          include: {
            SavingsGoal: true,
            expenses: true,
          },
        },
      },
    });

    for (const user of users) {
      await this.checkSavingsGoals(user.id);
      await this.checkBudgetSpending(user.id);
    }

    this.logger.log('Budget notifications complete.');
  }

  /**
   * Check user savings goals and notify if hit
   */
  private async checkSavingsGoals(userId: string) {
    const goals = await this.prisma.savingsGoal.findMany({
      where: { userId, isCompleted: false },
    });

    for (const goal of goals) {
      if (goal.savedAmount >= goal.targetAmount) {
        const exists = await this.prisma.budgetNotification.findFirst({
          where: {
            userId,
            body: `You made it to your target for "${goal.title}"!`,
          },
        });

        if (!exists) {
          await this.prisma.budgetNotification.create({
            data: {
              userId,
              title: 'Budget Notification',
              body: `You made it to your savings goal "${goal.title}"! Go use that money to write the next chapter of your story.`,
              type: 'SAVINGS_TARGET',
              savingsGoalId: goal.id, // link to the goal
            },
          });

          // mark goal as completed
          await this.prisma.savingsGoal.update({
            where: { id: goal.id },
            data: { isCompleted: true },
          });
        }
      }
    }
  }

  /**
   * Check budget spending and notify if exceeded
   */
 private async checkBudgetSpending(userId: string) {
  const budgets = await this.prisma.budget.findMany({
    where: { userId },
    include: { expenses: true, SavingsGoal: true },
  });

  for (const budget of budgets) {
    const totalSpent = budget.expenses.reduce((sum, e) => sum + e.amount, 0);

    // pick the first active goal (or undefined)
    const activeGoal = budget.SavingsGoal.find(g => !g.isCompleted);

    if (totalSpent > budget.limit) {
      const exists = await this.prisma.budgetNotification.findFirst({
        where: {
          userId,
          body: `You’ve exceeded your budget for "${activeGoal?.title || 'this goal'}"!`,
        },
      });

      if (!exists) {
        await this.prisma.budgetNotification.create({
          data: {
            userId,
            title: 'Budget Notification',
            body: `You’ve exceeded your budget for "${activeGoal?.title || 'this goal'}"! Consider adjusting your spending.`,
            type: 'BUDGET_EXCEEDED',
            savingsGoalId: activeGoal?.id,
          },
        });
      }
    }
  }
}

}
