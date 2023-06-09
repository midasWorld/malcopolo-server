import { validate } from 'class-validator';
import { LoginUserDto } from './login-user.dto';
import { faker } from '@faker-js/faker';

describe('LoginUserDto', () => {
  test.each([
    {
      email: '',
      password: '',
    },
    {
      email: 'invalidEmail.com',
      password: faker.internet.password({ length: 4 }),
    },
    {
      email: faker.internet.email(),
      password: '',
    },
    {
      email: faker.internet.email(),
      password: faker.internet.password({ length: 3 }),
    },
    {
      email: faker.internet.email(),
      password: faker.internet.password({ length: 21 }),
    },
  ])(
    '유효하지 않은 정보로 로그인 요청 시 실패한다.',
    async ({ email, password }) => {
      const request = new LoginUserDto();
      request.email = email;
      request.password = password;

      const errors = await validate(request);
      expect(errors.length).toBeGreaterThanOrEqual(1);
    },
  );

  test.each([
    {
      email: faker.internet.email(),
      password: faker.internet.password({ length: 4 }),
    },
    {
      email: faker.internet.email(),
      password: faker.internet.password({ length: 20 }),
    },
  ])('유효한 정보로 로그인 요청 시 성공한다.', async ({ email, password }) => {
    const request = new LoginUserDto();
    request.email = email;
    request.password = password;

    const errors = await validate(request);
    expect(errors.length).toEqual(0);
  });
});
