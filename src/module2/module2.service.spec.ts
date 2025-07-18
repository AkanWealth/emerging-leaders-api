import { Test, TestingModule } from '@nestjs/testing';
import { Module2Service } from './module2.service';

describe('Module2Service', () => {
  let service: Module2Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Module2Service],
    }).compile();

    service = module.get<Module2Service>(Module2Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
