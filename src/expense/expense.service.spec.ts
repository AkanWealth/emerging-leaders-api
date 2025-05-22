import { Test, TestingModule } from '@nestjs/testing';
import { ExpenseService } from './expense.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrisma = {
  expense: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('ExpenseService', () => {
  let service: ExpenseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpenseService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ExpenseService>(ExpenseService);
  });

  it('should create an expense', async () => {
    const userId = 'user-id';
    const dto = {
      amount: 100,
      description: 'Groceries',
      categoryId: 'category-id',
    };
    const expected = { id: 'expense-id', ...dto, userId };

    mockPrisma.expense.create.mockResolvedValue(expected);
    const result = await service.create(userId, dto);

    expect(result).toEqual(expected);
    expect(mockPrisma.expense.create).toHaveBeenCalledWith({
      data: { ...dto, userId },
    });
  });

  it('should return all expenses for a user', async () => {
    const userId = 'user-id';
    const expected = [{ id: '1', amount: 100 }];
    mockPrisma.expense.findMany.mockResolvedValue(expected);

    const result = await service.findAll(userId);
    expect(result).toEqual(expected);
    expect(mockPrisma.expense.findMany).toHaveBeenCalledWith({
      where: { userId },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('should return a single expense by id', async () => {
    const id = 'expense-id';
    const userId = 'user-id';
    const expected = { id, userId };
    mockPrisma.expense.findFirst.mockResolvedValue(expected);

    const result = await service.findOne(id, userId);
    expect(result).toEqual(expected);
  });

  it('should throw if expense not found', async () => {
    mockPrisma.expense.findFirst.mockResolvedValue(null);
    await expect(service.findOne('invalid-id', 'user-id')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should update an expense', async () => {
    const id = 'expense-id';
    const userId = 'user-id';
    const dto = { amount: 150 };

    mockPrisma.expense.findFirst.mockResolvedValue({ id });
    mockPrisma.expense.update.mockResolvedValue({ id, ...dto });

    const result = await service.update(id, userId, dto);
    expect(result).toEqual({ id, ...dto });
  });

  it('should delete an expense', async () => {
    const id = 'expense-id';
    const userId = 'user-id';

    mockPrisma.expense.findFirst.mockResolvedValue({ id });
    mockPrisma.expense.delete.mockResolvedValue({ id });

    const result = await service.remove(id, userId);
    expect(result).toEqual({ id });
  });
});
