import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,   // прибирає зайві поля з body
      transform: true,   // приводить типи (id з string -> number)
    }),
  );

  await app.listen(3000);
}
bootstrap();
