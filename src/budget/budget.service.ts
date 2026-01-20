import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { ActivityLogService } from '../activity-log/activity-log.service';

@Injectable()
export class BudgetService {
  constructor(
    private prisma: PrismaService,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async create(userId: string, dto: CreateBudgetDto) {
    const budget = await this.prisma.budget.create({
      data: { ...dto, userId },
    });

    await this.activityLogService.log(userId, `Created a budget of ₦${dto.limit}`);
    return budget;
  }

  async findAll(userId: string) {
    return this.prisma.budget.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        expenses: true,
        SavingsGoal: true,       // ✅ link savings goals attached to this budget
        SavingsTopUp: true,      // ✅ link top-ups done under this budget     
      },
    });
  }

  async findOne(id: string, userId: string) {
    const budget = await this.prisma.budget.findFirst({
      where: { id, userId },
      include: {
        category: true,
        expenses: true,
        SavingsGoal: true,       // ✅
        SavingsTopUp: true,      // ✅
      },
    });
    if (!budget) throw new NotFoundException('Budget not found');
    return budget;
  }

  async update(id: string, userId: string, dto: UpdateBudgetDto) {
    await this.findOne(id, userId); // Ensures existence
    const updated = await this.prisma.budget.update({
      where: { id },
      data: dto,
    });

    await this.activityLogService.log(userId, `Updated budget: ₦${updated.limit}`);
    return updated;
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId); // Ensures existence
    await this.activityLogService.log(userId, `Deleted budget: ${id}`);
    return this.prisma.budget.delete({ where: { id } });
  }
}
