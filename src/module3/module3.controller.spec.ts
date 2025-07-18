import { Test, TestingModule } from '@nestjs/testing';
import { Module3Controller } from './module3.controller';

describe('Module3Controller', () => {
  let controller: Module3Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Module3Controller],
    }).compile();

    controller = module.get<Module3Controller>(Module3Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
