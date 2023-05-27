import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import authConfig from 'src/config/auth.config';
import { EmailService } from 'src/email/email.service';
import { PrismaService } from 'src/prisma/prisma.service';
import * as uuid from 'uuid';
import { LoginUserDto } from './dto/login-user.dto';
import { SignupUserDto } from './dto/signup-user.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    @Inject(authConfig.KEY) private config: ConfigType<typeof authConfig>,
  ) {}

  async signup(request: SignupUserDto) {
    const { email, password, name } = request;

    const userExists = await this.checkUserExists(email);
    if (userExists) {
      throw new BadRequestException('해당 이메일로는 가입이 불가능합니다.');
    }

    console.log(typeof this.config.bcrypt.saltRounds);
    const hashed = await bcrypt.hash(password, this.config.bcrypt.saltRounds);
    await this.save(email, hashed, name).then((userId) => {
      const signupVerifyToken = uuid.v1();
      this.saveSignupVerifyToken(userId, signupVerifyToken);
      this.sendMemberJoinEmail(email, signupVerifyToken);
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
      data: { email, password, name },
    });

    return user.id;
  }

  private async saveSignupVerifyToken(userId: number, token: string) {
    await this.prisma.emailAuth.create({
      data: { userId, token },
    });
  }

  private async sendMemberJoinEmail(email: string, signupVerifyToken: string) {
    await this.emailService.sendMemberJoinVerification(
      email,
      signupVerifyToken,
    );
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

    return this.createJwtToken(user.id);
  }

  async login(request: LoginUserDto): Promise<string> {
    const { email, password } = request;
    const user = await this.prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('해당 회원 정보가 존재하지 않습니다.');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedException(
        '아이디(이메일) 또는 비밀번호가 유효하지 않습니다.',
      );
    }

    return this.createJwtToken(user.id);
  }

  createJwtToken(id: number) {
    return jwt.sign({ id }, this.config.jwt.secret, {
      expiresIn: this.config.jwt.expiresInSec,
      issuer: this.config.jwt.issuer,
    });
  }
}
