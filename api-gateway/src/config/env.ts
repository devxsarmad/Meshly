import 'dotenv/config';

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  authServiceUrl: required('AUTH_SERVICE_URL'),
  productServiceUrl: required('PRODUCT_SERVICE_URL'),
  cartServiceUrl: required('CART_SERVICE_URL'),
  orderServiceUrl: required('ORDER_SERVICE_URL'),
  paymentServiceUrl: required('PAYMENT_SERVICE_URL'),
  corsOrigin: required('CORS_ORIGIN'),
  jwtAccessSecret: required('JWT_ACCESS_SECRET'),
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 900000),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX ?? 100),
};
