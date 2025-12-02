import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  //  дозволяємо запити з інших девайсів/доменів
  app.enableCors();

  const port = process.env.PORT || 3000;

  //  дуже важливо: '0.0.0.0', щоб був доступ із телефона
  await app.listen(port, '0.0.0.0');
}
bootstrap();
