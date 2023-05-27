import { AuthService } from 'src/app/auth/auth.service';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { SignupUserDto } from './dto/signup-user.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  async create(@Body() request: SignupUserDto): Promise<void> {
    await this.authService.signup(request);
  }

  @Post('/email-verify')
  async verifyEmail(@Query() request: VerifyEmailDto): Promise<string> {
    return await this.authService.verifyEmail(request);
  }

  @Post('/login')
  async login(@Body() request: LoginUserDto): Promise<string> {
    return await this.authService.login(request);
  }

  @Get('/csrf-token')
  async csrfToken() {
    return await this.authService.createCSRFToken();
  }
}
