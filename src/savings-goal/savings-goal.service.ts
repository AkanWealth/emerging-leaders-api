import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSavingsGoalDto } from './dto/create-savings-goal.dto';
import {UpdateSavingsGoalDto} from './dto/update-savings-goal.dto'

@Injectable()
export class SavingsGoalService {
  constructor(private readonly prisma: PrismaService) {}

async create(userId: string, dto: CreateSavingsGoalDto) {
  return this.prisma.$transaction(async (prisma) => {
    // Step 1: Check if targetAmount is provided
    if (dto.targetAmount === undefined || dto.targetAmount <= 0) {
      throw new BadRequestException('A valid target amount is required to create a savings goal');
    }

    // Step 2: Fetch user's wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    // Step 3: Check if wallet has enough balance
    if (wallet.balance < dto.targetAmount) {
      throw new BadRequestException('Insufficient wallet balance for this savings goal');
    }

    // Step 4: Deduct target amount from wallet
    await prisma.wallet.update({
      where: { userId },
      data: {
        balance: {
          decrement: dto.targetAmount,
        },
      },
    });

    // Step 5: Create the savings goal
    const goal = await prisma.savingsGoal.create({
      data: {
        userId,
        currency: dto.currency,
        monthlyIncome: dto.monthlyIncome,
        hasSpecificGoal: dto.hasSpecificGoal,
        goalTitle: dto.goalTitle,
        targetAmount: dto.targetAmount,
        targetDate: dto.targetDate,
        goalIcon: dto.goalIcon,
      },
    });

    return goal;
  });
}


  async findAll(userId: string) {
    return this.prisma.savingsGoal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const goal = await this.prisma.savingsGoal.findFirst({
      where: { id, userId },
    });
    if (!goal) throw new NotFoundException('Savings goal not found');
    return goal;
  }

  // async update(id: string, userId: string, dto: UpdateSavingsGoalDto) {
  //   const goal = await this.prisma.savingsGoal.findFirst({
  //     where: { id, userId },
  //   });
  //   if (!goal) throw new NotFoundException('Savings goal not found');

  //   return this.prisma.savingsGoal.update({
  //     where: { id },
  //     data: dto,
  //   });
  // }

  async update(id: string, userId: string, dto: UpdateSavingsGoalDto) {
  return this.prisma.$transaction(async (prisma) => {
    const goal = await prisma.savingsGoal.findFirst({
      where: { id, userId },
    });

    if (!goal) {
      throw new NotFoundException('Savings goal not found');
    }

    // If targetAmount is being updated
    if (dto.targetAmount !== undefined && dto.targetAmount > goal.targetAmount) {
      const additionalAmount = dto.targetAmount - goal.targetAmount;

      const wallet = await prisma.wallet.findUnique({
        where: { userId },
      });

      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }

      if (wallet.balance < additionalAmount) {
        throw new BadRequestException('Insufficient wallet balance to increase savings goal');
      }

      // Deduct the difference
      await prisma.wallet.update({
        where: { userId },
        data: {
          balance: {
            decrement: additionalAmount,
          },
        },
      });
    }

    // Now update the savings goal
    const updatedGoal = await prisma.savingsGoal.update({
      where: { id },
      data: dto,
    });

    return updatedGoal;
  });
}


  async remove(id: string, userId: string) {
    const goal = await this.prisma.savingsGoal.findFirst({
      where: { id, userId },
    });
    if (!goal) throw new NotFoundException('Savings goal not found');

    return this.prisma.savingsGoal.delete({
      where: { id },
    });
  }
}
