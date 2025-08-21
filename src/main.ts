import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import { join } from 'path';
import * as express from 'express';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule , {
    cors: {
      origin : 'http://localhost:4200',
      credentials: true,
      methods: 'GET,POST,PUT,DELETE',
      allowedHeaders: 'Content-Type, Authorization',
    }
  });

  app.use(bodyParser.json({ limit: '40mb' }));
  app.use(bodyParser.urlencoded({ limit: '40mb', extended: true }));

  // rendre le dossier uploads accessible
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();