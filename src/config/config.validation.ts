import * as Joi from "joi";

export const configValidationSchema = Joi.object({
  DATABASE_URL: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default("15m"),
  REFRESH_TOKEN_EXPIRES_IN: Joi.string().default("7d"),
  REFRESH_IDLE_TTL: Joi.string().default("7d"),
  REFRESH_ABSOLUTE_TTL: Joi.string().default("30d"),
  REDIS_URL: Joi.string().required(),
  REDIS_PREFIX: Joi.string().optional(),
  MAIL_HOST: Joi.string().required(),
  MAIL_PORT: Joi.number().required(),
  MAIL_USER: Joi.string().required(),
  MAIL_PASS: Joi.string().required(),
  MAIL_FROM: Joi.string().required(),
  APP_URL: Joi.string().default("http://localhost:3000"),
  FRONTEND_URL: Joi.string().default("http://localhost:5173"),
});
