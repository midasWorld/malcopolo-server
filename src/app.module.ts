import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuthModule } from './app/auth/auth.module';
import { HealthCheckModule } from './app/health-check/health-check.module';
import { UsersModule } from './app/users/users.module';
import authConfig from './common/config/auth.config';
import emailConfig from './common/config/email.config';
import { validationSchema } from './common/config/validation.schema';
import { PrismaModule } from './common/prisma/prisma.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    HealthCheckModule,
    ConfigModule.forRoot({
      envFilePath: [`.env.${process.env.NODE_ENV}`],
      load: [emailConfig, authConfig],
      isGlobal: true,
      validationSchema,
    }),
    UsersModule,
    AuthModule,
    PrismaModule,
  ],
})
export class AppModule {}
