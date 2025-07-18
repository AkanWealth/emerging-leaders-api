import { Test, TestingModule } from '@nestjs/testing';
import { Module2Controller } from './module2.controller';

describe('Module2Controller', () => {
  let controller: Module2Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Module2Controller],
    }).compile();

    controller = module.get<Module2Controller>(Module2Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
