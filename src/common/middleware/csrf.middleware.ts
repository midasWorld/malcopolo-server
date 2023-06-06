import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';

export function csrfCheck(req: Request, res: Response, next: NextFunction) {
  if (
    req.method === 'GET' ||
    req.method === 'OPTIONS' ||
    req.method === 'HEAD'
  ) {
    return next();
  }

  const csrfHeader = req.get('malcopolo-csrf-token');

  if (!csrfHeader) {
    console.warn(
      'Missing required "malcopolo-csrf-token" header',
      req.headers.origin,
    );
    return res.status(403).json({ message: 'Failed CSRF check' });
  }

  validateCsrfToken(csrfHeader)
    .then((valid) => {
      if (!valid) {
        console.warn(
          'Value provided in "malcopolo-csrf-token" header does not validate',
          req.headers.origin,
          csrfHeader,
        );
        return res.status(403).json({ message: 'Failed CSRF check' });
      }
      next();
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ message: 'Something went wrong' });
    });
}

async function validateCsrfToken(csrfHeader) {
  return bcrypt.compare(process.env.CSRF_SECRET_KEY, csrfHeader);
}
