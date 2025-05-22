import { Test, TestingModule } from '@nestjs/testing';
import { BudgetController } from './budget.controller';
import { BudgetService } from './budget.service';

describe('BudgetController', () => {
  let controller: BudgetController;
  let service: BudgetService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BudgetController],
      providers: [{ provide: BudgetService, useValue: mockService }],
    }).compile();

    controller = module.get<BudgetController>(BudgetController);
    service = module.get<BudgetService>(BudgetService);
  });

  it('should create a budget', async () => {
    const dto = {
      limit: 5000,
      categoryId: 'category-id',
      repeat: 'monthly',
    };
    const userId = 'user-id';
    const result = { id: 'budget-id', ...dto, userId };

    mockService.create.mockResolvedValue(result);
    expect(await controller.create(userId, dto)).toEqual(result);
    expect(mockService.create).toHaveBeenCalledWith(userId, dto);
  });

  it('should get all budgets for a user', async () => {
    const userId = 'user-id';
    const result = [{ id: 'budget-id' }];
    mockService.findAll.mockResolvedValue(result);

    expect(await controller.findAll(userId)).toEqual(result);
  });

  it('should get a specific budget', async () => {
    const userId = 'user-id';
    const id = 'budget-id';
    const result = { id };
    mockService.findOne.mockResolvedValue(result);

    expect(await controller.findOne(userId, id)).toEqual(result);
  });

  it('should update a budget', async () => {
    const userId = 'user-id';
    const id = 'budget-id';
    const dto = { limit: 7000 };
    const result = { id, ...dto };

    mockService.update.mockResolvedValue(result);
    expect(await controller.update(userId, id, dto)).toEqual(result);
  });

  it('should delete a budget', async () => {
    const userId = 'user-id';
    const id = 'budget-id';
    const result = { id };

    mockService.remove.mockResolvedValue(result);
    expect(await controller.remove(userId, id)).toEqual(result);
  });
});
