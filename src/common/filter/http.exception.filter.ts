import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

type ErrorResponse = {
  message: string;
};

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    const { message } = (
      exception as HttpException
    ).getResponse() as ErrorResponse;

    response //
      .status(status)
      .json({
        timestamp: new Date().toISOString(),
        message,
      });
  }
}
