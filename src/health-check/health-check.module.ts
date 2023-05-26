import { TerminusModule } from '@nestjs/terminus';
import { Module } from '@nestjs/common';
import { HealthCheckController } from './health-check.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [TerminusModule, HttpModule],
  controllers: [HealthCheckController],
})
export class HealthCheckModule {}
