import { csrfCheck } from '@common/middleware/csrf.middleware';
import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test } from '@nestjs/testing';
import { EmailAuth, User } from '@prisma/client';
import { AppModule } from '@src/app.module';
import { PrismaService } from '@common/prisma/prisma.service';
import bcrypt from 'bcrypt';
import request from 'supertest';

describe('회원 관리', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let eventEmitter: EventEmitter2;

  let loginUser: Pick<User, 'email' | 'password'>;
  let user: User;
  let emailAuth: EmailAuth;
  let csrfToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    eventEmitter = moduleRef.get<EventEmitter2>(EventEmitter2);
    prisma = moduleRef.get<PrismaService>(PrismaService);

    app = moduleRef.createNestApplication();
    app.use(csrfCheck);
    await app.init();

    /** 더미 데이터 등록 */
    const userRequest = getTestUser(1);

    const { email, password } = userRequest;
    loginUser = { email, password };

    const hashed = await bcrypt.hash(password, 10);
    user = await prisma.user.create({
      data: { ...userRequest, password: hashed },
    });
    const emailAuthRequest = getTestEmailAuth(1, user.id);
    emailAuth = await prisma.emailAuth.create({ data: emailAuthRequest });
  });

  afterAll(async () => {
    /** 더미 데이터 삭제 */
    await prisma.$transaction([
      prisma.emailAuth.delete({ where: { userId: user.id } }),
      prisma.user.delete({ where: { email: user.email } }),
    ]);

    await app.close();
  });

  describe('/csrf-token', () => {
    it('CSRF 토큰 없이 요청 시 실패하고 403 코드를 반환한다.', async () => {
      const { email, password } = user;

      return request(app.getHttpServer()) //
        .post('/login')
        .set('Accept', 'application/json')
        .send({ email, password })
        .expect(403);
    });

    it('CSRF 토큰 요청 시 성공하고 200 코드와 함께 CSRF 토큰을 반환한다.', async () => {
      const res = await request(app.getHttpServer()) //
        .get('/auth/csrf-token')
        .set('Accept', 'application/json');

      expect(res.status).toEqual(200);
      expect(res.text.length).toBeGreaterThan(0);

      csrfToken = res.text;
    });
  });

  describe('/POST auth', () => {
    it('회원 가입에 성공하고 201 코드를 반환한다.', async () => {
      const signupRequest = {
        email: faker.internet.email(),
        password: faker.internet.password({ length: 4 }),
        name: faker.person.firstName(),
      };

      jest.spyOn(eventEmitter, 'emit').mockImplementation();

      const res = await request(app.getHttpServer()) //
        .post('/auth')
        .set('Accept', 'application/json')
        .set('malcopolo-csrf-token', csrfToken)
        .send(signupRequest);

      expect(res.status).toEqual(201);

      /** 사용된 데이터 삭제 */
      const deleteUser = await prisma.user.findUnique({
        where: { email: signupRequest.email },
      });
      await prisma.$transaction([
        prisma.emailAuth.delete({ where: { userId: deleteUser.id } }),
        prisma.user.delete({ where: { id: deleteUser.id } }),
      ]);
    });

    it('존재하는 회원의 이메일로 회원 가입 시 실패하고 400 코드를 반환한다..', async () => {
      const alreadExistsEmailUserRequest = {
        email: user.email,
        password: faker.internet.password({ length: 4 }),
        name: faker.person.firstName(),
      };

      jest.spyOn(eventEmitter, 'emit').mockImplementation();

      return request(app.getHttpServer()) //
        .post('/auth')
        .set('Accept', 'application/json')
        .set('malcopolo-csrf-token', csrfToken)
        .send(alreadExistsEmailUserRequest)
        .expect(400);
    });
  });

  describe('/email-verify', () => {
    it('이메일 인증에 성공하고 200 코드와 함께 JWT 토큰을 반환한다.', async () => {
      const res = await request(app.getHttpServer()) //
        .put('/auth/email-verify')
        .set('malcopolo-csrf-token', csrfToken)
        .send({ signupVerifyToken: emailAuth.token });

      expect(res.status).toEqual(200);
      expect(res.text.length).toBeGreaterThan(0);
    });

    it('이메일 인증할 회원이 존재하지 않으면 실패하고 404 코드를 반환한다.', async () => {
      return request(app.getHttpServer()) //
        .put('/auth/email-verify')
        .set('Accept', 'application/json')
        .set('malcopolo-csrf-token', csrfToken)
        .send({ signupVerifyToken: 'invalidToken' })
        .expect(404);
    });

    it('이미 이메일 인증이 된 경우 실패하고 400 코드를 반환한다.', async () => {
      return request(app.getHttpServer()) //
        .put('/auth/email-verify')
        .set('Accept', 'application/json')
        .set('malcopolo-csrf-token', csrfToken)
        .send({ signupVerifyToken: emailAuth.token })
        .expect(400);
    });
  });

  describe('/login', () => {
    it('로그인에 성공하고 201 코드와 함께 JWT 토큰을 반환한다.', async () => {
      const res = await request(app.getHttpServer()) //
        .post('/auth/login')
        .set('Accept', 'application/json')
        .set('malcopolo-csrf-token', csrfToken)
        .send(loginUser);

      expect(res.status).toEqual(201);
      expect(res.text.length).toBeGreaterThan(0);
    });

    it('로그인할 회원이 존재하지 않는 경우 실패하고 404 코드를 반환한다.', async () => {
      return request(app.getHttpServer()) //
        .post('/auth/login')
        .set('Accept', 'application/json')
        .set('malcopolo-csrf-token', csrfToken)
        .send({ email: 'invalidEmail', password: loginUser.password })
        .expect(404);
    });

    it('비밀번호가 일치하지 않는 경우 실패하고 404 코드를 반환한다.', async () => {
      return request(app.getHttpServer()) //
        .post('/auth/login')
        .set('Accept', 'application/json')
        .set('malcopolo-csrf-token', csrfToken)
        .send({ email: loginUser.email, password: 'invalidPassword' })
        .expect(404);
    });
  });
});

function getTestUser(id: number) {
  return {
    id,
    email: faker.internet.email(),
    password: faker.internet.password({ length: 4 }),
    name: faker.person.firstName(),
    emailVerified: null,
    image: null,
  };
}

function getTestEmailAuth(id: number, userId: number) {
  return {
    id,
    token: faker.string.alphanumeric({ length: 12 }),
    userId,
  };
}
