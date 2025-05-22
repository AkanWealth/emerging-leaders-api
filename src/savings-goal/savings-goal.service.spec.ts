import { Test, TestingModule } from '@nestjs/testing';
import { SavingsGoalService } from './savings-goal.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
  savingsGoal: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('SavingsGoalService', () => {
  let service: SavingsGoalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SavingsGoalService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<SavingsGoalService>(SavingsGoalService);
  });

  it('should create savings goal', async () => {
    const userId = 'user-id';
    const dto = {
      currency: 'USD',
      amount: 1000,
      hasSpecificGoal: true,
      goalTitle: 'Vacation',
      targetAmount: 1000,
      targetDate: new Date(),
      goalIcon: '🌴',
    };

    const expected = { id: 'goal-id', ...dto, userId };

    mockPrismaService.savingsGoal.create.mockResolvedValue(expected);

    const result = await service.create(userId, dto);
    expect(result).toEqual(expected);
    expect(mockPrismaService.savingsGoal.create).toHaveBeenCalledWith({
      data: { ...dto, userId },
    });
  });

  it('should return all savings goals for user', async () => {
    const userId = 'user-id';
    const expected = [{ id: '1', currency: 'USD', amount: 1000 }];
    mockPrismaService.savingsGoal.findMany.mockResolvedValue(expected);

    const result = await service.findAll(userId);
    expect(result).toEqual(expected);
    expect(mockPrismaService.savingsGoal.findMany).toHaveBeenCalledWith({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('should update a savings goal', async () => {
    const id = 'goal-id';
    const userId = 'user-id';
    const dto = { amount: 2000 };

    mockPrismaService.savingsGoal.findFirst.mockResolvedValue({ id });
    mockPrismaService.savingsGoal.update.mockResolvedValue({ id, ...dto });

    const result = await service.update(id, userId, dto);
    expect(result).toEqual({ id, ...dto });
  });

  it('should delete a savings goal', async () => {
    const id = 'goal-id';
    const userId = 'user-id';

    mockPrismaService.savingsGoal.findFirst.mockResolvedValue({ id });
    mockPrismaService.savingsGoal.delete.mockResolvedValue({ id });

    const result = await service.remove(id, userId);
    expect(result).toEqual({ id });
  });
});
