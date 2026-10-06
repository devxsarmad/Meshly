import 'dotenv/config';

const required = (name: string): string => { const value = process.env[name]; if (!value) throw new Error(`Missing required environment variable: ${name}`); return value; };
export const env = { port: Number(process.env.PORT ?? 3004), databaseUrl: required('DATABASE_URL'), productServiceUrl: required('PRODUCT_SERVICE_URL'), paymentServiceUrl: required('PAYMENT_SERVICE_URL'), internalServiceKey: required('INTERNAL_SERVICE_KEY'), rabbitmqUrl: required('RABBITMQ_URL'), rabbitmqExchange: process.env.RABBITMQ_EXCHANGE ?? 'meshly.events', orderPaymentQueue: process.env.ORDER_PAYMENT_QUEUE ?? 'order-service.payment-events', jwtAccessSecret: required('JWT_ACCESS_SECRET'), corsOrigin: required('CORS_ORIGIN') };
