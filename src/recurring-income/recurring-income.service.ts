import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecurringIncomeDto } from './dto/create-recurring-income.dto';
import { UpdateRecurringIncomeDto } from './dto/update-recurring-income.dto';

@Injectable()
export class RecurringIncomeService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateRecurringIncomeDto) {
    return this.prisma.recurringIncome.create({ data: dto });
  }

  findAllByUser(userId: string) {
    return this.prisma.recurringIncome.findMany({
      where: { userId },
      include: { currency: true },
    });
  }

  async update(id: string, dto: UpdateRecurringIncomeDto) {
    const income = await this.prisma.recurringIncome.findUnique({ where: { id } });
    if (!income) throw new NotFoundException('Recurring income not found');
    return this.prisma.recurringIncome.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    return this.prisma.recurringIncome.delete({ where: { id } });
  }

  async getCreditLogsByUser(userId: string) {
  return this.prisma.recurringIncomeLog.findMany({
    where: {
      recurringIncome: {
        userId,
      },
    },
    include: {
      recurringIncome: {
        select: {
          amount: true,
          frequency: true,
          description: true,
          currency: true,
        },
      },
    },
    orderBy: { creditedAt: 'desc' },
  });
}


async getCreditLogsByIncome(incomeId: string) {
  return this.prisma.recurringIncomeLog.findMany({
    where: { recurringIncomeId: incomeId },
    orderBy: { creditedAt: 'desc' },
  });
}

}
