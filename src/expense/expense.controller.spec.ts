import { Test, TestingModule } from '@nestjs/testing';
import { ExpenseController } from './expense.controller';
import { ExpenseService } from './expense.service';

describe('ExpenseController', () => {
  let controller: ExpenseController;
  let service: ExpenseService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpenseController],
      providers: [{ provide: ExpenseService, useValue: mockService }],
    }).compile();

    controller = module.get<ExpenseController>(ExpenseController);
    service = module.get<ExpenseService>(ExpenseService);
  });

  it('should create an expense', async () => {
    const dto = {
      amount: 100,
      description: 'Groceries',
      categoryId: 'category-id',
    };
    const userId = 'user-id';
    const result = { id: 'expense-id', ...dto, userId };

    mockService.create.mockResolvedValue(result);
    expect(await controller.create(userId, dto)).toEqual(result);
    expect(mockService.create).toHaveBeenCalledWith(userId, dto);
  });

  it('should get all expenses for a user', async () => {
    const userId = 'user-id';
    const result = [{ id: 'expense-id' }];
    mockService.findAll.mockResolvedValue(result);

    expect(await controller.findAll(userId)).toEqual(result);
    expect(mockService.findAll).toHaveBeenCalledWith(userId);
  });

  it('should get a specific expense', async () => {
    const userId = 'user-id';
    const id = 'expense-id';
    const result = { id };
    mockService.findOne.mockResolvedValue(result);

    expect(await controller.findOne(userId, id)).toEqual(result);
    expect(mockService.findOne).toHaveBeenCalledWith(id, userId);
  });

  it('should update an expense', async () => {
    const userId = 'user-id';
    const id = 'expense-id';
    const dto = { amount: 150 };
    const updatedExpense = { id, ...dto };

    mockService.update.mockResolvedValue(updatedExpense);
    expect(await controller.update(userId, id, dto)).toEqual(updatedExpense);
    expect(mockService.update).toHaveBeenCalledWith(id, userId, dto);
  });

  it('should delete an expense', async () => {
    const userId = 'user-id';
    const id = 'expense-id';
    const deletedExpense = { id };

    mockService.remove.mockResolvedValue(deletedExpense);
    expect(await controller.remove(userId, id)).toEqual(deletedExpense);
    expect(mockService.remove).toHaveBeenCalledWith(id, userId);
  });
});
