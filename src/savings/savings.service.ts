import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSavingsDto } from './dto/create-savings.dto';
import { TopupSavingsDto } from './dto/topup-savings.dto';
import { MailService } from 'src/mail/mail.service';
import { ActivityLogService } from 'src/activity-log/activity-log.service';

@Injectable()
export class SavingsService {
  private readonly logger = new Logger(SavingsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async createGoal(userId: string, dto: CreateSavingsDto) {
    // Optional: Verify budget exists if budgetId provided
   const budget = dto.budgetId
  ? await this.prisma.budget.findFirst({
      where: { id: dto.budgetId, userId },
    })
  : null;

if (dto.budgetId && !budget) {
  throw new BadRequestException('Invalid budget reference');
}
    if (!dto.targetAmount || dto.targetAmount <= 0) {
      throw new BadRequestException('A valid target amount is required');
    }

    const goal = await this.prisma.savingsGoal.create({
      data: {
        userId,
        title: dto.title,
        targetAmount: dto.targetAmount,
        targetDate: new Date(dto.targetDate),
        icon: dto.icon,
        budgetId: dto.budgetId || null,
      },
      include: { Budget: true },
    });

    await this.activityLogService.log(
      userId,
      `Created savings goal: ${goal.title}${goal.Budget ? ` (linked to budget: ${goal.Budget.limit})` : ''}`
    );

    return goal;
  }

  async getGoals(userId: string) {
    return this.prisma.savingsGoal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { Budget: true },
    });
  }

  async topUp(userId: string, dto: TopupSavingsDto) {
    const goal = await this.prisma.savingsGoal.findFirst({
      where: { id: dto.goalId, userId },
      include: { Budget: true },
    });

    if (!goal) throw new NotFoundException('Savings goal not found');

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { wallet: true, currency: true },
    });

    if (!user?.wallet || user.wallet.balance < dto.amount) {
      throw new BadRequestException('Insufficient wallet balance');
    }

    const isCompleted = (goal.savedAmount ?? 0) + dto.amount >= goal.targetAmount;

    await this.prisma.$transaction([
      this.prisma.wallet.update({
        where: { id: user.wallet.id },
        data: { balance: { decrement: dto.amount } },
      }),
      this.prisma.savingsGoal.update({
        where: { id: dto.goalId },
        data: {
          savedAmount: { increment: dto.amount },
          isCompleted,
        },
      }),
      this.prisma.savingsTopUp.create({
        data: {
          userId,
          savingsGoalId: dto.goalId,
          amount: dto.amount,
          budgetId: goal.budgetId || null,
        },
      }),
    ]);

    await this.activityLogService.log(
      userId,
      `Topped up savings goal: ${goal.title} by ${user.currency?.symbol || '₦'}${dto.amount}${goal.Budget ? ` (linked to budget: ${goal.Budget.limit})` : ''}`
    );

    await this.sendIncomeNotification(user.email, {
      amount: dto.amount.toLocaleString(),
      currency: user.currency?.symbol || '₦',
      type: 'savings top-up',
      frequency: 'manual',
    });

    return { message: 'Savings goal topped up successfully' };
  }

  async deleteGoal(userId: string, goalId: string) {
    const goal = await this.prisma.savingsGoal.findFirst({
      where: { id: goalId, userId },
      include: { Budget: true },
    });

    if (!goal) throw new NotFoundException('Savings goal not found or access denied');

    await this.prisma.savingsGoal.delete({
      where: { id: goalId },
    });

    await this.activityLogService.log(
      userId,
      `Deleted savings goal: ${goal.title}${goal.Budget ? ` (was linked to budget)` : ''}`
    );

    return { message: 'Savings goal deleted successfully' };
  }

  private async sendIncomeNotification(
    to: string,
    data: { amount: string; currency: string; type: string; frequency: string },
  ) {
    try {
      await this.mailService.sendEmailWithTemplate(to, 40502898, {
        amount: `${data.currency}${data.amount}`,
        frequency: data.frequency,
        type: data.type,
      });
    } catch (error) {
      this.logger.error(`Failed to send income notification to ${to}`, error);
    }
  }
}
