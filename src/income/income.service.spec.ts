import { Test, TestingModule } from '@nestjs/testing';
import { IncomeService } from './income.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
  income: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('IncomeService', () => {
  let service: IncomeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IncomeService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<IncomeService>(IncomeService);
  });

  it('should create income', async () => {
    const userId = 'user-id';
    const dto = { amount: 2000, description: 'Bonus', categoryId: 'category-id' };
    const expected = { id: 'income-id', ...dto, userId };

    mockPrismaService.income.create.mockResolvedValue(expected);

    const result = await service.create(userId, dto);
    expect(result).toEqual(expected);
    expect(mockPrismaService.income.create).toHaveBeenCalledWith({
      data: { ...dto, userId },
    });
  });

  it('should return all incomes for a user', async () => {
    const userId = 'user-id';
    const expected = [{ id: '1', amount: 100, categoryId: 'cat1' }];
    mockPrismaService.income.findMany.mockResolvedValue(expected);

    const result = await service.findAll(userId);
    expect(result).toEqual(expected);
    expect(mockPrismaService.income.findMany).toHaveBeenCalledWith({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    });
  });

  it('should throw if income not found on findOne', async () => {
    mockPrismaService.income.findFirst.mockResolvedValue(null);
    await expect(service.findOne('invalid-id', 'user-id')).rejects.toThrow(
      'Income not found',
    );
  });

  it('should update income', async () => {
    const id = 'income-id';
    const userId = 'user-id';
    // For update, the DTO might allow partial fields, but still categoryId required if your update DTO demands it
    const dto = { amount: 3000, description: 'Updated income', categoryId: 'category-id' };

    mockPrismaService.income.findFirst.mockResolvedValue({ id });
    mockPrismaService.income.update.mockResolvedValue({ id, ...dto });

    const result = await service.update(id, userId, dto);
    expect(result).toEqual({ id, ...dto });
  });

  it('should delete income', async () => {
    const id = 'income-id';
    const userId = 'user-id';

    mockPrismaService.income.findFirst.mockResolvedValue({ id });
    mockPrismaService.income.delete.mockResolvedValue({ id });

    const result = await service.remove(id, userId);
    expect(result).toEqual({ id });
  });
});
