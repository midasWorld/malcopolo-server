import { faker } from '@faker-js/faker';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test } from '@nestjs/testing';
import { User } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as uuid from 'uuid';
import authConfig from '@common/config/auth.config';
import { PrismaService } from '@common/prisma/prisma.service';
import { AuthService } from './auth.service';

jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('uuid');
jest.spyOn(uuid, 'v4').mockReturnValue('0000-0000-0000-0000');

describe('AuthService', () => {
  let authService: AuthService;
  let config: ConfigService;
  const prismaMock = {
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    emailAuth: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  };
  const eventEmitterMock = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: EventEmitter2,
          useValue: eventEmitterMock,
        },
      ],
      imports: [
        ConfigModule.forRoot({
          envFilePath: ['.env.test'],
          load: [authConfig],
        }),
      ],
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
    config = moduleRef.get<ConfigService>(ConfigService);
  });

  describe('회원가입(signup)', () => {
    it('회원 가입에 성공한다.', async () => {
      const password = '1234';
      const user = await newFakerUser(password, config);
      const { email, name } = user;

      prismaMock.user.findFirst.mockReturnValue(null);
      prismaMock.user.create.mockReturnValue(user);
      prismaMock.emailAuth.create.mockImplementation();
      eventEmitterMock.emit.mockImplementation();

      await expect(
        authService.signup({ email, password, name }),
      ).resolves.not.toThrow();

      expect(prismaMock.user.findFirst).toBeCalled();
      expect(prismaMock.user.create).toBeCalled();
      expect(prismaMock.emailAuth.create).toBeCalled();
      expect(eventEmitterMock.emit).toBeCalled();
    });

    it('이미 존재하는 이메일의 회원이라면 실패한다.', async () => {
      const password = '1234';
      const user = await newFakerUser(password, config);
      const { email, name } = user;

      prismaMock.user.findFirst.mockReturnValue(user);

      await expect(
        authService.signup({ email, password, name }),
      ).rejects.toThrowError(BadRequestException);
    });
  });

  describe('이메일 인증(verifyEmail)', () => {
    it('이메일 인증에 성공한다.', async () => {
      const signupVerifyToken = faker.string.alphanumeric({ length: 12 });

      const expectedJwtToken = faker.string.alphanumeric({ length: 12 });

      const user = await newFakerUser('1234', config);
      const emailAuth = newFakerEmailAuth(user);

      prismaMock.emailAuth.findUnique.mockResolvedValue(emailAuth);
      prismaMock.user.update.mockImplementation();
      jwt.sign = jest.fn().mockResolvedValue(expectedJwtToken);

      expect(authService.verifyEmail({ signupVerifyToken })) //
        .resolves.toEqual(expectedJwtToken);
    });

    it('해당 회원 정보가 존재하지 않아 실패한다.', async () => {
      const signupVerifyToken = faker.string.alphanumeric({ length: 12 });

      const emailAuth = newFakerEmailAuth(null);

      prismaMock.emailAuth.findUnique.mockResolvedValue(emailAuth);

      expect(authService.verifyEmail({ signupVerifyToken })) //
        .rejects.toThrowError(NotFoundException);
    });

    it('이미 인증된 상태라 실패한다.', async () => {
      const signupVerifyToken = faker.string.alphanumeric({ length: 12 });

      const user = await newFakerUser('1234', config);
      const alreadyVerifiedUser = { ...user, emailVerified: new Date() };
      const emailAuth = newFakerEmailAuth(alreadyVerifiedUser);

      prismaMock.emailAuth.findUnique.mockReturnValue(emailAuth);

      expect(authService.verifyEmail({ signupVerifyToken })) //
        .rejects.toThrowError(BadRequestException);
    });
  });

  describe('로그인(login)', () => {
    it('로그인에 성공하고 토큰을 반환한다.', async () => {
      const password = '1234';
      const user = await newFakerUser(password, config);

      const expectedJwtToken = 'jwt-token';

      prismaMock.user.findFirst.mockReturnValue(user);
      bcrypt.compare = jest.fn().mockResolvedValue(true);
      jwt.sign = jest.fn().mockReturnValue(expectedJwtToken);

      await expect(
        authService.login({ email: user.email, password }),
      ).resolves.toEqual(expectedJwtToken);
    });

    it('해당 이메일의 회원이 존재하지 않아 실패한다.', async () => {
      const email = faker.internet.email();
      const password = faker.internet.password({ length: 10 });

      prismaMock.user.findFirst.mockReturnValue(null);

      await expect(authService.login({ email, password })).rejects.toThrowError(
        NotFoundException,
      );
    });

    it('비밀번호가 일치하지 않아 실패한다.', async () => {
      const password = '1234';
      const user = await newFakerUser(password, config);
      const { email } = user;

      prismaMock.user.findFirst.mockResolvedValue(user);
      bcrypt.compare = jest.fn().mockResolvedValue(false);

      await expect(authService.login({ email, password })) //
        .rejects.toThrowError(NotFoundException);
    });
  });

  it('CSRF 토큰 발급에 성공한다.', async () => {
    const hash = jest.spyOn(bcrypt, 'hash');

    await expect(authService.createCSRFToken()).resolves.not.toThrow();

    expect(hash).toHaveBeenCalled();
  });
});

async function newFakerUser(
  password: string,
  config: ConfigService,
): Promise<User> {
  const bcryptSalt = Number(config.get('BCRYPT_SALT_ROUNDS'));
  const hashed = await bcrypt.hash(password, bcryptSalt);
  return {
    id: faker.number.int(),
    email: faker.internet.email(),
    password: hashed,
    name: faker.person.firstName(),
    emailVerified: null,
    image: null,
  };
}

function newFakerEmailAuth(user: User) {
  return {
    id: faker.number.int(),
    token: faker.string.uuid(),
    userId: user ? user.id : faker.number.int(),
    user: user,
  };
}
