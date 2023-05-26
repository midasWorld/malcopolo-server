import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/common/guard/auth.gurad';
import { CreateUserDto } from './dto/create-user.dto';
import { UserLoginDto } from './dto/user-login.dto';
import { UserDto } from './dto/user.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() request: CreateUserDto): Promise<void> {
    await this.usersService.create(request);
  }

  @Post('/email-verify')
  async verifyEmail(@Query() request: VerifyEmailDto): Promise<string> {
    return await this.usersService.verifyEmail(request);
  }

  @Post('/login')
  async login(@Body() request: UserLoginDto): Promise<string> {
    return await this.usersService.login(request);
  }

  @UseGuards(AuthGuard)
  @Get('/:id')
  async getUserInfo(@Param('id', ParseIntPipe) id: number): Promise<UserDto> {
    return await this.usersService.getUserInfo(id);
  }
}
