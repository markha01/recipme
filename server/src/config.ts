import { z } from 'zod';

const envSchema = z.object({
  PORT: z.string().default('3001'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  MINIO_ENDPOINT: z.string().default('localhost'),
  MINIO_PORT: z.string().default('9000'),
  MINIO_USE_SSL: z.string().default('false'),
  MINIO_ACCESS_KEY: z.string().default('minioadmin'),
  MINIO_SECRET_KEY: z.string().default('minioadmin'),
  MINIO_BUCKET: z.string().default('recipme'),
});

export type Env = z.infer<typeof envSchema>;

let _config: Env;

export function getConfig(): Env {
  if (!_config) {
    const result = envSchema.safeParse(process.env);
    if (!result.success) {
      console.error('Invalid environment variables:', result.error.flatten().fieldErrors);
      process.exit(1);
    }
    _config = result.data;
  }
  return _config;
}
