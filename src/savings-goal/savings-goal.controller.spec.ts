import { Test, TestingModule } from '@nestjs/testing';
import { SavingsGoalController } from './savings-goal.controller';
import { SavingsGoalService } from './savings-goal.service';

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('SavingsGoalController', () => {
  let controller: SavingsGoalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SavingsGoalController],
      providers: [{ provide: SavingsGoalService, useValue: mockService }],
    }).compile();

    controller = module.get<SavingsGoalController>(SavingsGoalController);
  });

  it('should create savings goal', async () => {
    const dto = {
      currency: 'USD',
      amount: 500,
      hasSpecificGoal: false,
    };
    const userId = 'user-id';
    const expected = { id: 'goal-id', ...dto, userId };

    mockService.create.mockResolvedValue(expected);

    const result = await controller.create(userId, dto);
    expect(result).toEqual(expected);
  });

  it('should get all savings goals', async () => {
    const userId = 'user-id';
    const expected = [{ id: '1' }];

    mockService.findAll.mockResolvedValue(expected);

    const result = await controller.findAll(userId);
    expect(result).toEqual(expected);
  });

  it('should update a savings goal', async () => {
    const id = 'goal-id';
    const userId = 'user-id';
    const dto = { amount: 750 };

    const expected = { id, ...dto };

    mockService.update.mockResolvedValue(expected);

    const result = await controller.update(id, userId, dto);
    expect(result).toEqual(expected);
  });

  it('should delete a savings goal', async () => {
    const id = 'goal-id';
    const userId = 'user-id';
    const expected = { id };

    mockService.remove.mockResolvedValue(expected);

    const result = await controller.remove(id, userId);
    expect(result).toEqual(expected);
  });
});
