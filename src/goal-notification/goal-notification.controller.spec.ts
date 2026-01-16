import { Test, TestingModule } from '@nestjs/testing';
import { GoalNotificationController } from './goal-notification.controller';

describe('GoalNotificationController', () => {
  let controller: GoalNotificationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoalNotificationController],
    }).compile();

    controller = module.get<GoalNotificationController>(GoalNotificationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
