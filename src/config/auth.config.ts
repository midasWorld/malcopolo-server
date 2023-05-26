import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresInSec: process.env.JWT_EXPIRES_SEC,
    issuer: process.env.JWT_ISSUER,
  },
}));
