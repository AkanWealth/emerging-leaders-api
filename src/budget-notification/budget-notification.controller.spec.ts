import { Test, TestingModule } from '@nestjs/testing';
import { BudgetNotificationController } from './budget-notification.controller';

describe('BudgetNotificationController', () => {
  let controller: BudgetNotificationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BudgetNotificationController],
    }).compile();

    controller = module.get<BudgetNotificationController>(BudgetNotificationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
