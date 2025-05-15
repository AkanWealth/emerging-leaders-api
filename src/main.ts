import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

   app.setGlobalPrefix('api/v1'); 
   
   const config = new DocumentBuilder()
    .setTitle('Goal Tracker API')
    .setDescription('API for managing projects, categories and goals')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

   app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  console.log('Starting server on port:', process.env.PORT);
  await app.listen(process.env.PORT ?? 8000);

}
bootstrap();
