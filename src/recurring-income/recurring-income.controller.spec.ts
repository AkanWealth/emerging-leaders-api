import { Test, TestingModule } from '@nestjs/testing';
import { RecurringIncomeController } from './recurring-income.controller';

describe('RecurringIncomeController', () => {
  let controller: RecurringIncomeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecurringIncomeController],
    }).compile();

    controller = module.get<RecurringIncomeController>(RecurringIncomeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
