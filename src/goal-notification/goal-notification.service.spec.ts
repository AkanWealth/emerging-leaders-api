import { Test, TestingModule } from '@nestjs/testing';
import { GoalNotificationService } from './goal-notification.service';

describe('GoalNotificationService', () => {
  let service: GoalNotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GoalNotificationService],
    }).compile();

    service = module.get<GoalNotificationService>(GoalNotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
