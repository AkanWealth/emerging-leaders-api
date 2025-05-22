import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { IncomeModule } from './income.module';
import { PrismaService } from '../prisma/prisma.service';

describe('IncomeController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const userId = 'test-user-id';

  const createIncomeDto = {
    amount: 1000,
    description: 'Test income',
    categoryId: 'test-category-id',
  };

  let incomeId: string; // to store id of created income for later tests

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [IncomeModule],
      providers: [PrismaService],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('/income (POST) - create income successfully', async () => {
    const res = await request(app.getHttpServer())
      .post('/income')
      .send(createIncomeDto)
      .set('userId', userId)
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.amount).toBe(createIncomeDto.amount);
    expect(res.body.description).toBe(createIncomeDto.description);
    expect(res.body.categoryId).toBe(createIncomeDto.categoryId);

    incomeId = res.body.id;
  });

  it('/income (POST) - fail if amount is missing', () => {
    const { amount, ...invalidDto } = createIncomeDto;

    return request(app.getHttpServer())
      .post('/income')
      .send(invalidDto)
      .set('userId', userId)
      .expect(400);
  });

  it('/income (GET) - get all incomes for user', async () => {
    const res = await request(app.getHttpServer())
      .get('/income')
      .set('userId', userId)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.find((income) => income.id === incomeId)).toBeDefined();
  });

  it('/income/:id (GET) - get single income by id', async () => {
    const res = await request(app.getHttpServer())
      .get(`/income/${incomeId}`)
      .set('userId', userId)
      .expect(200);

    expect(res.body.id).toBe(incomeId);
  });

  it('/income/:id (GET) - fail for invalid income id', () => {
    return request(app.getHttpServer())
      .get('/income/invalid-id')
      .set('userId', userId)
      .expect(400); // or 404 based on your controller error handling
  });

  it('/income/:id (PUT) - update income successfully', async () => {
    const updateDto = { amount: 1500, description: 'Updated income', categoryId: 'test-category-id' };

    const res = await request(app.getHttpServer())
      .put(`/income/${incomeId}`)
      .send(updateDto)
      .set('userId', userId)
      .expect(200);

    expect(res.body.amount).toBe(updateDto.amount);
    expect(res.body.description).toBe(updateDto.description);
  });

  it('/income/:id (PUT) - fail if missing required fields', () => {
    const { amount, ...invalidDto } = { amount: 1500, description: 'Updated income', categoryId: 'test-category-id' };

    return request(app.getHttpServer())
      .put(`/income/${incomeId}`)
      .send(invalidDto)
      .set('userId', userId)
      .expect(400);
  });

  it('/income/:id (DELETE) - delete income successfully', async () => {
    await request(app.getHttpServer())
      .delete(`/income/${incomeId}`)
      .set('userId', userId)
      .expect(204);
  });

  it('/income/:id (DELETE) - fail to delete non-existing income', () => {
    return request(app.getHttpServer())
      .delete(`/income/${incomeId}`)
      .set('userId', userId)
      .expect(404);
  });
});
