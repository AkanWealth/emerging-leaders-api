import { Test, TestingModule } from '@nestjs/testing';
import { RecurringIncomeCronService } from './recurring-income-cron.service';

describe('RecurringIncomeCronService', () => {
  let service: RecurringIncomeCronService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecurringIncomeCronService],
    }).compile();

    service = module.get<RecurringIncomeCronService>(RecurringIncomeCronService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
