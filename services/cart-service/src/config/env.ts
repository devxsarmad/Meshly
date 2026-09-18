import 'dotenv/config';

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
};

export const env = {
  port: Number(process.env.PORT ?? 3003),
  redisUrl: required('REDIS_URL'),
  cartTtlSeconds: Number(process.env.CART_TTL_SECONDS ?? 604800),
  jwtAccessSecret: required('JWT_ACCESS_SECRET'),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
};
