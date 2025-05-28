import cors from 'cors';
import helmet from 'helmet';
import pino from 'pino-http';
import express from 'express';

import logger from './utils/logger.js';

import routes from './routes/index.js';
import courseRoutes from './routes/courses/index.js';
import userRoutes from './routes/users/index.js';
import classRoutes from './routes/classes/index.js';

import passport from 'passport';
import { strategy } from './auth.js';

// Set up Express app
const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(pino({ logger }));
app.use((req, res, next) => {
  req.log.info({ req, body: req.body }, 'Request received');
  next();
});

// Initializing Passport
passport.use(strategy());
app.use(passport.initialize());

// Mount routes
app.use('/api', routes);
app.use('/api/courses', courseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/classes', classRoutes);

export default app;
