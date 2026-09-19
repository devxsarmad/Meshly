import 'dotenv/config';

const required = (name: string): string => { const value = process.env[name]; if (!value) throw new Error(`Missing required environment variable: ${name}`); return value; };
export const env = { port: Number(process.env.PORT ?? 3004), databaseUrl: required('DATABASE_URL'), productServiceUrl: required('PRODUCT_SERVICE_URL'), rabbitmqUrl: required('RABBITMQ_URL'), rabbitmqExchange: process.env.RABBITMQ_EXCHANGE ?? 'meshly.events', jwtAccessSecret: required('JWT_ACCESS_SECRET'), corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3000' };
