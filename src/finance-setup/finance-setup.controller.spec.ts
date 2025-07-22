import { Test, TestingModule } from '@nestjs/testing';
import { FinanceSetupController } from './finance-setup.controller';

describe('FinanceSetupController', () => {
  let controller: FinanceSetupController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FinanceSetupController],
    }).compile();

    controller = module.get<FinanceSetupController>(FinanceSetupController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
