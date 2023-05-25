import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { EmailService } from 'src/email/email.service';
import { PrismaService } from 'src/prisma/prisma.service';
import * as uuid from 'uuid';
import { CreateUserDto } from './dto/create-user.dto';
import { UserLoginDto } from './dto/user-login.dto';
import { UserDto } from './dto/user.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async create(request: CreateUserDto): Promise<void> {
    const { email, password, name } = request;

    const userExists = await this.checkUserExists(email);
    if (userExists) {
      throw new BadRequestException('해당 이메일로는 가입이 불가능합니다.');
    }

    await this.save(email, password, name).then((userId) => {
      const signupVerifyToken = uuid.v1();
      this.sendMemberJoinEmail(email, signupVerifyToken, userId);
    });
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
  ): Promise<number> {
    const user = await this.prisma.user.create({
      data: {
        email,
        password,
        name,
      },
    });

    return user.id;
  }

  private async sendMemberJoinEmail(
    email: string,
    signupVerifyToken: string,
    userId: number,
  ): Promise<void> {
    await this.emailService.sendMemberJoinVerification(
      email,
      signupVerifyToken,
    );

    await this.prisma.emailAuth.create({
      data: {
        token: signupVerifyToken,
        userId,
      },
    });
  }

  async verifyEmail(request: VerifyEmailDto): Promise<string> {
    const { signupVerifyToken } = request;
    const emailAuth = await this.prisma.emailAuth.findUnique({
      where: { token: signupVerifyToken },
      include: {
        user: true,
      },
    });

    if (emailAuth == null || emailAuth.user == null) {
      throw new NotFoundException('해당 회원 정보가 존재하지 않습니다.');
    }

    const user = emailAuth.user;
    if (user.emailVerified != null) {
      throw new BadRequestException('이미 인증되었습니다.');
    }

    await this.prisma.user.update({
      data: {
        emailVerified: new Date(),
      },
      where: { id: user.id },
    });

    // TODO: AuthService 구현 후 로그인(JWT 반환) 구현 예정
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
