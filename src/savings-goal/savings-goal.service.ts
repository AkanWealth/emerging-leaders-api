import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSavingsGoalDto } from './dto/create-savings-goal.dto';
import { UpdateSavingsGoalDto } from './dto/update-savings-goal.dto';
import { ActivityLogService } from '../activity-log/activity-log.service';

@Injectable()
export class SavingsGoalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async create(userId: string, dto: CreateSavingsGoalDto) {
    return this.prisma.$transaction(async (prisma) => {
      if (!dto.targetAmount || dto.targetAmount <= 0) {
        throw new BadRequestException('A valid target amount is required');
      }

      // const wallet = await prisma.wallet.findUnique({ where: { userId } });
      // if (!wallet) throw new NotFoundException('Wallet not found');
      // if (wallet.balance < dto.targetAmount) {
      //   throw new BadRequestException('Insufficient wallet balance');
      // }

      // await prisma.wallet.update({
      //   where: { userId },
      //   data: { balance: { decrement: dto.targetAmount } },
      // });

      const goal = await prisma.savingsGoal.create({
        data: {
          userId,
          icon: dto.icon,
          title: dto.title,
          targetAmount: dto.targetAmount,
          targetDate: new Date(dto.targetDate),
          budgetId: dto.budgetId || null,
          savedAmount: dto.targetAmount,
          isCompleted: dto.targetAmount >= dto.targetAmount, // or true if it's fully funded immediately
        },
      });

      await this.activityLogService.log(
        userId,
        `Created savings goal: ${goal.title}${goal.budgetId ? ` (linked to budget)` : ''}`,
      );

      return goal;
    });
  }

  async findAll(userId: string) {
    return this.prisma.savingsGoal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { Budget: true }, // ✅ use Budget with capital B
    });
  }

  async findOne(id: string, userId: string) {
    const goal = await this.prisma.savingsGoal.findFirst({
      where: { id, userId },
      include: { Budget: true },
    });
    if (!goal) throw new NotFoundException('Savings goal not found');
    return goal;
  }

  async update(id: string, userId: string, dto: UpdateSavingsGoalDto) {
    return this.prisma.$transaction(async (prisma) => {
      const goal = await prisma.savingsGoal.findFirst({
        where: { id, userId },
      });
      if (!goal) throw new NotFoundException('Savings goal not found');

      if (dto.targetAmount && dto.targetAmount > goal.targetAmount) {
        const additionalAmount = dto.targetAmount - goal.targetAmount;
        const wallet = await prisma.wallet.findUnique({ where: { userId } });
        if (!wallet) throw new NotFoundException('Wallet not found');
        if (wallet.balance < additionalAmount) {
          throw new BadRequestException('Insufficient wallet balance for update');
        }

        await prisma.wallet.update({
          where: { userId },
          data: { balance: { decrement: additionalAmount } },
        });
      }

      const updatedGoal = await prisma.savingsGoal.update({
        where: { id },
        data: {
          icon: dto.icon,
          title: dto.title,
          targetAmount: dto.targetAmount,
          targetDate: dto.targetDate ? new Date(dto.targetDate) : undefined,
          budgetId: dto.budgetId !== undefined ? dto.budgetId : goal.budgetId,
        },
      });

      await this.activityLogService.log(
        userId,
        `Updated savings goal: ${updatedGoal.title}`,
      );

      return updatedGoal;
    });
  }

  async remove(id: string, userId: string) {
    const goal = await this.prisma.savingsGoal.findFirst({
      where: { id, userId },
    });
    if (!goal) throw new NotFoundException('Savings goal not found');

    await this.prisma.savingsGoal.delete({
      where: { id },
    });

    await this.activityLogService.log(
      userId,
      `Deleted savings goal: ${goal.title}`,
    );

    return { message: 'Savings goal deleted successfully' };
  }

  async topUp(userId: string, goalId: string, amount: number, budgetId?: string) {
    return this.prisma.$transaction(async (prisma) => {
      const goal = await prisma.savingsGoal.findFirst({
        where: { id: goalId, userId },
      });
      if (!goal) throw new NotFoundException('Savings goal not found');

      const wallet = await prisma.wallet.findUnique({ where: { userId } });
      if (!wallet || wallet.balance < amount) {
        throw new BadRequestException('Insufficient wallet balance');
      }

      await prisma.wallet.update({
        where: { userId },
        data: { balance: { decrement: amount } },
      });

      const newSavedAmount = goal.savedAmount + amount;
      const isCompleted = newSavedAmount >= goal.targetAmount;

      await prisma.savingsGoal.update({
        where: { id: goalId },
        data: {
          savedAmount: newSavedAmount,
          isCompleted,
        },
      });

      await prisma.savingsTopUp.create({
        data: {
          userId,
          savingsGoalId: goalId,
          amount,
          budgetId: budgetId || null,
        },
      });

      await this.activityLogService.log(
        userId,
        `Topped up ₦${amount} to savings goal: ${goal.title}${budgetId ? ' (budget linked)' : ''}`,
      );

      return { message: 'Top-up successful' };
    });
  }
}
