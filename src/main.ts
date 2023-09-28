import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import { LoggerFactory } from './config/loggerFactory';

async function bootstrap() {
  const logger = new Logger('bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: LoggerFactory('Willibraun'),
  });

  const config = new DocumentBuilder()
    .setTitle('Willibraun Service API Documentation')
    .setDescription(
      'This document provides api-doc for willibraun backend services',
    )
    .setVersion('1.0')
    .addBasicAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('willibraun')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(new ValidationPipe());
  const port = 3333;
  await app.listen(port);
  logger.log('Application listening on port ' + port);
}
bootstrap();
