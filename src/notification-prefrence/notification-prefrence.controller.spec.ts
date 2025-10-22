import { Test, TestingModule } from '@nestjs/testing';
import { NotificationPrefrenceController } from './notification-prefrence.controller';

describe('NotificationPrefrenceController', () => {
  let controller: NotificationPrefrenceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationPrefrenceController],
    }).compile();

    controller = module.get<NotificationPrefrenceController>(NotificationPrefrenceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
