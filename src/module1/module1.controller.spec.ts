import { Test, TestingModule } from '@nestjs/testing';
import { Module1Controller } from './module1.controller';

describe('Module1Controller', () => {
  let controller: Module1Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Module1Controller],
    }).compile();

    controller = module.get<Module1Controller>(Module1Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
