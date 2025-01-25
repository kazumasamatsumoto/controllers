// controllers.mdの「リクエストペイロード」セクションのバリデーション設定
// ValidationPipeをグローバルに設定し、DTOの自動検証を有効化
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
