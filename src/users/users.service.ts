import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDto } from './dto/user.dto';
import * as uuid from 'uuid';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { UserLoginDto } from './dto/user-login.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(request: CreateUserDto): Promise<void> {
    const { email, password, name } = request;

    const userExists = await this.checkUserExists(email);
    if (userExists) {
      throw new BadRequestException('해당 이메일로는 가입이 불가능합니다.');
    }

    const signupVerifyToken = uuid.v1();

    await this.save(email, password, name);
    await this.sendMemberJoinEmail(email, signupVerifyToken);
  }

  private async checkUserExists(email: string): Promise<boolean> {
    const user = await this.prisma.user.findFirst({
      where: { email },
    });
    return user != null;
  }

  private async save(
    email: string,
    password: string,
    name: string,
  ): Promise<void> {
    this.prisma.user.create({
      data: {
        email,
        password,
        name,
      },
    });
  }

  private async sendMemberJoinEmail(
    email: string,
    signupVerifyToken: string,
  ): Promise<void> {
    // TODO: Email Service 구현 예정
  }

  async verifyEmail(request: VerifyEmailDto): Promise<string> {
    // TODO: DB 연동 후 구현 예정
    // 1. DB 에서 signupVerifyToken으로 회원 가입 처리중인 회원 존재 여부 확인
    // 2. 곧바로 로그인을 위해 JWT 발급

    throw new Error('Method not implemented.');
  }

  async login(request: UserLoginDto): Promise<string> {
    // TODO: DB 연동 후 구현 예정
    // 1. email, password → DB 확인 (없으면 에러)
    // 2. JWT 발급
    throw new Error('Method not implemented.');
  }

  async getUserInfo(id: number): Promise<UserDto> {
    const user: User = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('해당 회원은 존재하지 않습니다.');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }
}
