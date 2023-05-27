import * as Joi from 'joi';

export const validationSchema = Joi.object({
  EMAIL_SERVICE: Joi.string().required(),
  EMAIL_AUTH_USER: Joi.string().required(),
  EMAIL_AUTH_PASSWORD: Joi.string().required(),
  EMAIL_BASE_URL: Joi.string().required().uri(),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_SEC: Joi.number().required(),
  CORS_ALLOW_ORIGIN: Joi.string().required().uri(),
  BCRYPT_SALT_ROUNDS: Joi.number().required(),
});
