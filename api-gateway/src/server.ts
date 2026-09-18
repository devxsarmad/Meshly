import { app } from './app';
import { env } from './config/env';

app.listen(env.port, () => console.log(`API gateway listening on port ${env.port}`));
