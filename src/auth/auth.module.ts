import { Module } from '@nestjs/common';
import { EmailModule } from 'src/email/email.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [EmailModule, AuthModule],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
