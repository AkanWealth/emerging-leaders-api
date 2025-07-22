import { Test, TestingModule } from '@nestjs/testing';
import { FinanceSetupService } from './finance-setup.service';

describe('FinanceSetupService', () => {
  let service: FinanceSetupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FinanceSetupService],
    }).compile();

    service = module.get<FinanceSetupService>(FinanceSetupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
