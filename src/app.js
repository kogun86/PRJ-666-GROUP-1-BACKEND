import cors from 'cors';
import helmet from 'helmet';
import pino from 'pino-http';
import express from 'express';

import logger from './utils/logger.js';

import routes from './routes/index.js';

// Set up Express app
const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(pino({ logger }));

// Mount routes
app.use('/api', routes);

export default app;
