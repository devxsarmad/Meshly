import 'dotenv/config';

const required = (name: string, fallback?: string): string => {
  const value = process.env[name] ?? fallback;
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  authServiceUrl: required('AUTH_SERVICE_URL', 'http://localhost:3001'),
  productServiceUrl: required('PRODUCT_SERVICE_URL', 'http://localhost:3002'),
  cartServiceUrl: required('CART_SERVICE_URL', 'http://localhost:3003'),
  orderServiceUrl: required('ORDER_SERVICE_URL', 'http://localhost:3004'),
  corsOrigin: required('CORS_ORIGIN', 'http://localhost:3007'),
  jwtAccessSecret: required('JWT_ACCESS_SECRET'),
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 900000),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX ?? 100),
};
