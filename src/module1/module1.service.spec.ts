import { Test, TestingModule } from '@nestjs/testing';
import { Module1Service } from './module1.service';

describe('Module1Service', () => {
  let service: Module1Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Module1Service],
    }).compile();

    service = module.get<Module1Service>(Module1Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
