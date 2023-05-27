import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresInSec: parseInt(process.env.JWT_EXPIRES_SEC || '86400'),
    issuer: process.env.JWT_ISSUER,
  },
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10'),
  },
  csrf: {
    secret: process.env.CSRF_SECRET_KEY,
  },
}));
