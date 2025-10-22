import { Test, TestingModule } from '@nestjs/testing';
import { NotificationPrefrenceService } from './notification-prefrence.service';

describe('NotificationPrefrenceService', () => {
  let service: NotificationPrefrenceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationPrefrenceService],
    }).compile();

    service = module.get<NotificationPrefrenceService>(NotificationPrefrenceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
