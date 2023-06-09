import { validate } from 'class-validator';
import { faker } from '@faker-js/faker';
import { SignupUserDto } from './signup-user.dto';

describe('SignupUserDto', () => {
  test.each([
    {
      email: '',
      password: '',
      name: '',
    },
    {
      email: 'invalidEmail.com',
      password: faker.internet.password({ length: 4 }),
      name: faker.person.firstName(),
    },
    {
      email: faker.internet.email(),
      password: '',
      name: faker.person.firstName(),
    },
    {
      email: faker.internet.email(),
      password: faker.internet.password({ length: 3 }),
      name: faker.person.firstName(),
    },
    {
      email: faker.internet.email(),
      password: faker.internet.password({ length: 21 }),
      name: faker.person.firstName(),
    },
    {
      email: faker.internet.email(),
      password: faker.internet.password({ length: 4 }),
      name: '',
    },
    {
      email: faker.internet.email(),
      password: faker.internet.password({ length: 4 }),
      name: faker.string.alphanumeric({ length: 1 }),
    },
    {
      email: faker.internet.email(),
      password: faker.internet.password({ length: 4 }),
      name: faker.string.alphanumeric({ length: 31 }),
    },
  ])(
    '유효하지 않은 정보로 회원 가입 요청 시 실패한다.',
    async ({ email, password, name }) => {
      const request = new SignupUserDto();
      request.email = email;
      request.password = password;
      request.name = name;

      const errors = await validate(request);
      expect(errors.length).toBeGreaterThanOrEqual(1);
    },
  );

  test.each([
    {
      email: faker.internet.email(),
      password: faker.internet.password({ length: 4 }),
      name: faker.person.firstName(),
    },
    {
      email: faker.internet.email(),
      password: faker.internet.password({ length: 20 }),
      name: faker.person.firstName(),
    },
    {
      email: faker.internet.email(),
      password: faker.internet.password({ length: 4 }),
      name: faker.string.alphanumeric({ length: 2 }),
    },
    {
      email: faker.internet.email(),
      password: faker.internet.password({ length: 4 }),
      name: faker.string.alphanumeric({ length: 30 }),
    },
  ])(
    '유효한 정보로 회원 가입 요청 시 성공한다.',
    async ({ email, password, name }) => {
      const request = new SignupUserDto();
      request.email = email;
      request.password = password;
      request.name = name;

      const errors = await validate(request);
      expect(errors.length).toEqual(0);
    },
  );
});
