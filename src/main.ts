import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as morgan from 'morgan';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.use(morgan('tiny'));

  app.enableCors({
    origin: process.env.CORS_ALLOW_ORIGIN,
    optionsSuccessStatus: 204,
  });

  await app.listen(3000);
}
bootstrap();
