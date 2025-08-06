import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule , {
    cors: {
      origin : 'http://localhost:4200',
      credentials: true,
      methods: 'GET,POST,PUT,DELETE',
      allowedHeaders: 'Content-Type, Authorization',
    }
  });

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();