import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSavingsGoalDto } from './dto/create-savings-goal.dto';
import {UpdateSavingsGoalDto} from './dto/update-savings-goal.dto'

@Injectable()
export class SavingsGoalService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateSavingsGoalDto) {
    return this.prisma.savingsGoal.create({
      data: {
        ...dto,
        userId,
      },
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

  async update(id: string, userId: string, dto: UpdateSavingsGoalDto) {
    const goal = await this.prisma.savingsGoal.findFirst({
      where: { id, userId },
    });
    if (!goal) throw new NotFoundException('Savings goal not found');

    return this.prisma.savingsGoal.update({
      where: { id },
      data: dto,
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
