import { Test, TestingModule } from '@nestjs/testing';
import { MindsetService } from './mindset.service';

describe('MindsetService', () => {
  let service: MindsetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MindsetService],
    }).compile();

    service = module.get<MindsetService>(MindsetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
