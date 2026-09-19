import { app } from './app';
import { env } from './config/env';
import { connectEventBus } from './events/order-events';
import { prisma } from './repositories/order-repository';

Promise.all([prisma.$connect(), connectEventBus()]).then(() => app.listen(env.port, () => console.log(`Order service listening on port ${env.port}`))).catch((error: unknown) => { console.error('Order service startup failed', error); process.exit(1); });
