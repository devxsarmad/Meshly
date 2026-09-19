import 'dotenv/config';

const required = (name: string): string => { const value = process.env[name]; if (!value) throw new Error(`Missing required environment variable: ${name}`); return value; };
export const env = { port: Number(process.env.PORT ?? 3006), rabbitmqUrl: required('RABBITMQ_URL'), rabbitmqExchange: process.env.RABBITMQ_EXCHANGE ?? 'meshly.events', notificationQueue: process.env.NOTIFICATION_QUEUE ?? 'notification-service.events' };
