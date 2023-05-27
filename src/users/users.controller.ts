import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/common/guard/auth.gurad';
import { UserDto } from './dto/user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @Get('/:id')
  async getUserInfo(@Param('id', ParseIntPipe) id: number): Promise<UserDto> {
    return await this.usersService.getUserInfo(id);
  }
}
