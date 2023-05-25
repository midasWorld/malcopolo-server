import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDto } from './dto/user.dto';
import * as uuid from 'uuid';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { UserLoginDto } from './dto/user-login.dto';

@Injectable()
export class UsersService {
  async create(request: CreateUserDto): Promise<void> {
    const { email, password, name } = request;

    await this.checkUserExists(email);

    const signupVerifyToken = uuid.v1();

    await this.saveUser(email, password, name);
    await this.sendMemberJoinEmail(email, signupVerifyToken);
  }

  private checkUserExists(email: string): boolean {
    // TODO: DB 연동 후 구현 예정
    return false;
  }

  private saveUser(email: string, password: string, name: string): void {
    // TODO: DB 연동 후 구현 예정
    return;
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
    throw new Error('Method not implemented.');
  }
}
