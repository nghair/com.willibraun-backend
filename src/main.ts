import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { LoggerFactory } from './config/loggerFactory';

async function bootstrap() {
  const logger = new Logger('bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: LoggerFactory('Willibraun'),
  });
  app.useGlobalPipes(new ValidationPipe());
  const port=3333;
  await app.listen(port);
  logger.log('Application listening on port ' + port);
}
bootstrap();
