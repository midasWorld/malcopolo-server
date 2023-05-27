import { TerminusModule } from '@nestjs/terminus';
import { Module } from '@nestjs/common';
import { HealthCheckController } from './health-check.controller';
import { HttpModule } from '@nestjs/axios';
import { PrismaHealthIndicator } from './prisma-health.indicator';

@Module({
  imports: [TerminusModule, HttpModule],
  controllers: [HealthCheckController],
  providers: [PrismaHealthIndicator],
})
export class HealthCheckModule {}
