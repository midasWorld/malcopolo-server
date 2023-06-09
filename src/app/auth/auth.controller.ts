import { AuthService } from './auth.service';
import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { SignupUserDto } from './dto/signup-user.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { LoginUserDto } from './dto/login-user.dto';
import authConfig from '@common/config/auth.config';
import { ConfigType } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(authConfig.KEY) private config: ConfigType<typeof authConfig>,
  ) {}

  @Post()
  async create(@Body() request: SignupUserDto): Promise<void> {
    await this.authService.signup(request);
  }

  @Post('/email-verify')
  async verifyEmail(@Query() request: VerifyEmailDto): Promise<string> {
    return await this.authService.verifyEmail(request);
  }

  @Post('/login')
  async login(
    @Body() request: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<string> {
    const token = await this.authService.login(request);
    this.setToken(res, token);

    return token;
  }

  private setToken(res, token) {
    const options = {
      maxAge: this.config.jwt.cookie.maxAge,
      httpOnly: true,
      sameSite: this.config.jwt.cookie.sameSite,
      secure: true,
    };
    res.cookie(this.config.jwt.cookie.key, token, options);
  }

  @Get('/csrf-token')
  async csrfToken() {
    return await this.authService.createCSRFToken();
  }
}
