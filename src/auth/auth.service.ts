import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import authConfig from 'src/config/auth.config';
import * as jwt from 'jsonwebtoken';

interface JwtUserInfo {
  id: number;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(authConfig.KEY) private config: ConfigType<typeof authConfig>,
  ) {}

  createJwtToken(id: number) {
    return jwt.sign({ id }, this.config.jwt.secret, {
      expiresIn: this.config.jwt.expiresInSec,
      issuer: this.config.jwt.issuer,
    });
  }

  verifyToken(token: string) {
    try {
      const payload = jwt.verify(token, this.config.jwt.secret) as JwtUserInfo;

      const { id } = payload;

      return id;
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
}
