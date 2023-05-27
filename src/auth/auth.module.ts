import { Module } from '@nestjs/common';
import { EmailModule } from 'src/email/email.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserEventsListener } from './event/user-events.listener';

@Module({
  imports: [EmailModule, AuthModule],
  providers: [AuthService, UserEventsListener],
  controllers: [AuthController],
})
export class AuthModule {}
