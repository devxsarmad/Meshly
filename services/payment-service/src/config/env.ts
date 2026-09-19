import 'dotenv/config';

const required = (name: string): string => { const value = process.env[name]; if (!value) throw new Error(`Missing required environment variable: ${name}`); return value; };
export const env = { port: Number(process.env.PORT ?? 3005), databaseUrl: required('DATABASE_URL'), rabbitmqUrl: required('RABBITMQ_URL'), rabbitmqExchange: process.env.RABBITMQ_EXCHANGE ?? 'meshly.events', paymentQueue: process.env.PAYMENT_QUEUE ?? 'payment-service.order-placed', failureRate: Number(process.env.MOCK_PAYMENT_FAILURE_RATE ?? 0) };
