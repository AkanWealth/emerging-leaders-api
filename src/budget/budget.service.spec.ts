import { Test, TestingModule } from '@nestjs/testing';
import { BudgetService } from './budget.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrisma = {
  budget: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('BudgetService', () => {
  let service: BudgetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BudgetService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<BudgetService>(BudgetService);
  });

  it('should create a budget', async () => {
    const userId = 'user-id';
    const dto = {
      limit: 5000,
      categoryId: 'category-id',
      repeat: 'monthly',
    };
    const expected = { id: 'budget-id', ...dto, userId };

    mockPrisma.budget.create.mockResolvedValue(expected);
    const result = await service.create(userId, dto);

    expect(result).toEqual(expected);
    expect(mockPrisma.budget.create).toHaveBeenCalledWith({
      data: { ...dto, userId },
    });
  });

  it('should return all budgets for a user', async () => {
    const userId = 'user-id';
    const expected = [{ id: '1', limit: 2000 }];
    mockPrisma.budget.findMany.mockResolvedValue(expected);

    const result = await service.findAll(userId);
    expect(result).toEqual(expected);
    expect(mockPrisma.budget.findMany).toHaveBeenCalledWith({
      where: { userId },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('should return a single budget by id', async () => {
    const id = 'budget-id';
    const userId = 'user-id';
    const expected = { id, userId };
    mockPrisma.budget.findFirst.mockResolvedValue(expected);

    const result = await service.findOne(id, userId);
    expect(result).toEqual(expected);
  });

  it('should throw if budget not found', async () => {
    mockPrisma.budget.findFirst.mockResolvedValue(null);
    await expect(service.findOne('invalid-id', 'user-id')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should update a budget', async () => {
    const id = 'budget-id';
    const userId = 'user-id';
    const dto = { limit: 10000 };

    mockPrisma.budget.findFirst.mockResolvedValue({ id });
    mockPrisma.budget.update.mockResolvedValue({ id, ...dto });

    const result = await service.update(id, userId, dto);
    expect(result).toEqual({ id, ...dto });
  });

  it('should delete a budget', async () => {
    const id = 'budget-id';
    const userId = 'user-id';

    mockPrisma.budget.findFirst.mockResolvedValue({ id });
    mockPrisma.budget.delete.mockResolvedValue({ id });

    const result = await service.remove(id, userId);
    expect(result).toEqual({ id });
  });
});
