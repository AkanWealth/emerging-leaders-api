import { Test, TestingModule } from '@nestjs/testing';
import { MindsetController } from './mindset.controller';

describe('MindsetController', () => {
  let controller: MindsetController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MindsetController],
    }).compile();

    controller = module.get<MindsetController>(MindsetController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
