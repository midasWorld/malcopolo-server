import { validate } from 'class-validator';
import { faker } from '@faker-js/faker';
import { VerifyEmailDto } from './verify-email.dto';

describe('VerifyEmailDto', () => {
  it('빈 문자열로 이메일 인증 요청 시 실패한다.', async () => {
    const request = new VerifyEmailDto();
    request.signupVerifyToken = '';

    const errors = await validate(request);
    expect(errors.length).toBeGreaterThanOrEqual(1);
  });

  it('문자열로 이메일 인증 요청 시 성공한다.', async () => {
    const request = new VerifyEmailDto();
    request.signupVerifyToken = faker.string.alphanumeric({ length: 1 });

    const errors = await validate(request);
    expect(errors.length).toEqual(0);
  });
});
