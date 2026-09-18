import mongoose from 'mongoose';
import { app } from './app';
import { env } from './config/env';

mongoose.connect(env.mongoUri).then(() => { app.listen(env.port, () => console.log(`Product service listening on port ${env.port}`)); }).catch((error: unknown) => { console.error('MongoDB connection failed', error); process.exit(1); });
