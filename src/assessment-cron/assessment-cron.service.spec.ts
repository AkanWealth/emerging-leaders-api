import { Test, TestingModule } from '@nestjs/testing';
import { AssessmentCronService } from './assessment-cron.service';

describe('AssessmentCronService', () => {
  let service: AssessmentCronService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AssessmentCronService],
    }).compile();

    service = module.get<AssessmentCronService>(AssessmentCronService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
