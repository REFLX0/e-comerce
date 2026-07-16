import * as Joi from 'joi';

export const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(4000),
  DATABASE_URL: Joi.string().uri().required().description('PostgreSQL connection string'),
  JWT_SECRET: Joi.string().min(16).required().description('JWT signing secret (min 16 chars)'),
  CLOUDINARY_CLOUD_NAME: Joi.string().optional(),
  CLOUDINARY_API_KEY: Joi.string().optional(),
  CLOUDINARY_API_SECRET: Joi.string().optional(),
  RESEND_API_KEY: Joi.string().optional(),
  REDIS_HOST: Joi.string().optional(),
  REDIS_PORT: Joi.number().optional(),
  FRONTEND_URL: Joi.string().uri().optional(),
});

export function validateEnv(config: Record<string, unknown>) {
  const { error, value } = envSchema.validate(config, { allowUnknown: true, abortEarly: false });
  if (error) {
    const messages = error.details.map((d) => `  "${d.path.join('.')}": ${d.message}`).join('\n');
    throw new Error(`Environment validation failed:\n${messages}`);
  }
  return value;
}
