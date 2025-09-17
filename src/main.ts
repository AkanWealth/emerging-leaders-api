
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
// import helmet from 'helmet';
// import cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';


dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useLogger(new Logger());

  // Security middleware
  // app.use(helmet());
  // app.use(cookieParser());

  // Enable CORS
  app.enableCors({
    origin: '*', // Adjust in production to allow only trusted domains
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Set global API prefix
  app.setGlobalPrefix('api/v1');

  
  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Mobile API')
    .setDescription('The mobile backend API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/doc', app, document); // Match the global prefix

  // Global validation pipes
app.useGlobalPipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }),
);


  const port = process.env.PORT || 8080;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}/api/v1`);
  console.log(`📘 Swagger docs available at: http://localhost:${port}/api/doc`);
}
bootstrap();
