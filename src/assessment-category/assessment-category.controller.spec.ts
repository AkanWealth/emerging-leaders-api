import { Test, TestingModule } from '@nestjs/testing';
import { AssessmentCategoryController } from './assessment-category.controller';

describe('AssessmentCategoryController', () => {
  let controller: AssessmentCategoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssessmentCategoryController],
    }).compile();

    controller = module.get<AssessmentCategoryController>(AssessmentCategoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
