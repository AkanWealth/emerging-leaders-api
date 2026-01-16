import { Test, TestingModule } from '@nestjs/testing';
import { BudgetNotificationService } from './budget-notification.service';

describe('BudgetNotificationService', () => {
  let service: BudgetNotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BudgetNotificationService],
    }).compile();

    service = module.get<BudgetNotificationService>(BudgetNotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
