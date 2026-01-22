import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BudgetNotificationService {
  private readonly logger = new Logger(BudgetNotificationService.name);

  constructor(private prisma: PrismaService) {}

  // Messages grouped by type
  private savingsGoalMessages = [
    "Saving towards your Bigger Yes!",
    "You made it to your target! Go use that money to write the next chapter of your story, however big or small. Celebrate!",
    "Now that you’ve hit that target, what else can you be saving towards? Think medium or long term goals.",
    "Small changes make a BIG difference. Congratulations!",
    "Remember, you’ve got this. You’re saving towards that Bigger Yes!",
    "If we don’t lead our finances, our finances will lead us.",
    "In order to lead our money, we must first lead ourselves."
  ];

  private budgetExceededMessages = [
    "You’ve exceeded your budget! Consider adjusting your spending.",
    "Oops! Spending is higher than your set budget. Let's plan better.",
    "Stay within budget to reach your goals faster."
  ];

  /** Fetch unread notifications for frontend */
  async fetchUnread(userId: string) {
    return this.prisma.budgetNotification.findMany({
      where: { userId, read: false },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Mark a notification as read */
  async markAsRead(id: string) {
    return this.prisma.budgetNotification.update({
      where: { id },
      data: { read: true },
    });
  }

  /** Get next message for a savings goal */
  async getNextSavingsGoalMessage(userId: string, goal: any) {
    if (goal.isCompleted || goal.savedAmount < goal.targetAmount) return null;

    // Track last message shown
    let progress = await this.prisma.userBudgetProgress.findFirst({
      where: { userId, savingsGoalId: goal.id },
    });

    const lastIdx = progress?.lastMessageIdx ?? -1;
    const nextIdx = lastIdx + 1;
    if (nextIdx >= this.savingsGoalMessages.length) return null;

    const message = this.savingsGoalMessages[nextIdx];

    if (progress) {
      await this.prisma.userBudgetProgress.update({
        where: { id: progress.id },
        data: { lastMessageIdx: nextIdx },
      });
    } else {
      await this.prisma.userBudgetProgress.create({
        data: { userId, savingsGoalId: goal.id, lastMessageIdx: nextIdx },
      });
    }

    return {
      savingsGoalId: goal.id,
      title: 'Savings Target Achieved',
      body: message,
      type: 'SAVINGS_TARGET',
    };
  }

  /** Get next message for a budget overspend event */
  async getNextBudgetExceededMessage(userId: string, budget: any) {
    const totalSpent = budget.expenses.reduce((sum, e) => sum + e.amount, 0);
    if (totalSpent <= budget.limit) return null;

    let progress = await this.prisma.userBudgetProgress.findFirst({
      where: { userId, budgetId: budget.id },
    });

    const lastIdx = progress?.lastMessageIdx ?? -1;
    const nextIdx = lastIdx + 1;
    if (nextIdx >= this.budgetExceededMessages.length) return null;

    const message = this.budgetExceededMessages[nextIdx];

    if (progress) {
      await this.prisma.userBudgetProgress.update({
        where: { id: progress.id },
        data: { lastMessageIdx: nextIdx },
      });
    } else {
      await this.prisma.userBudgetProgress.create({
        data: { userId, budgetId: budget.id, lastMessageIdx: nextIdx },
      });
    }

    return {
      budgetId: budget.id,
      title: 'Budget Alert',
      body: message,
      type: 'BUDGET_EXCEEDED',
    };
  }

  /** Fetch all today's messages for a user (one per event) */
  async getTodayMessages(userId: string) {
    const savingsGoals = await this.prisma.savingsGoal.findMany({
      where: { userId },
    });

    const budgets = await this.prisma.budget.findMany({
      where: { userId },
      include: { expenses: true, SavingsGoal: true },
    });

    const messages: any[] = [];

    for (const goal of savingsGoals) {
      const msg = await this.getNextSavingsGoalMessage(userId, goal);
      if (msg) messages.push(msg);
    }

    for (const budget of budgets) {
      const msg = await this.getNextBudgetExceededMessage(userId, budget);
      if (msg) messages.push(msg);
    }

    return messages;
  }
}
