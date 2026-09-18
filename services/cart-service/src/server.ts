import { app } from './app';
import { env } from './config/env';
import { redis } from './utils/redis';

redis.on('error', (error: Error) => console.error('Redis connection error', error));
redis.ping().then(() => app.listen(env.port, () => console.log(`Cart service listening on port ${env.port}`))).catch((error: unknown) => { console.error('Redis connection failed', error); process.exit(1); });
