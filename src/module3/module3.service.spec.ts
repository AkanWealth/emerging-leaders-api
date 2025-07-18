import { Test, TestingModule } from '@nestjs/testing';
import { Module3Service } from './module3.service';

describe('Module3Service', () => {
  let service: Module3Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Module3Service],
    }).compile();

    service = module.get<Module3Service>(Module3Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
