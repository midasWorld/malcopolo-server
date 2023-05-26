import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import emailConfig from './config/email.config';
import { validationSchema } from './config/validation.schema';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import authConfig from './config/auth.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.${process.env.NODE_ENV}`],
      load: [emailConfig, authConfig],
      isGlobal: true,
      validationSchema,
    }),
    UsersModule,
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
