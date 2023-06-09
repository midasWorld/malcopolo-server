import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import jwt from 'jsonwebtoken';
import { Observable } from 'rxjs';
import authConfig from '@common/config/auth.config';

type JwtPayload = {
  id: string;
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(authConfig.KEY) private config: ConfigType<typeof authConfig>,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request);
  }

  private validateRequest(request) {
    let token = request.headers.authorization.split('Bearer ')[1];

    if (!token) {
      token = request.cookies[this.config.jwt.cookie.key];
    }

    try {
      jwt.verify(token, this.config.jwt.secret) as JwtPayload;
    } catch (e) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
