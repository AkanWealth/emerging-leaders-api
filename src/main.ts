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
 const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8000;
console.log(`Starting server on port: ${port}`);
await app.listen(port);


}
bootstrap();
