import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import authConfig from 'src/config/auth.config';
import * as jwt from 'jsonwebtoken';

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
}
