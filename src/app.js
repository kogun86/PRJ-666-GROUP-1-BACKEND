import cors from 'cors';
import helmet from 'helmet';
import pino from 'pino-http';
import express from 'express';
import passport from 'passport';

import logger from './utils/logger.js';
import authenticate from './utils/auth.js';
import { strategy } from './utils/auth.js';

import mainRouter from './routes/index.js';
import courseRoutes from './routes/courses/index.js';
import userRoutes from './routes/users/index.js';
import classRoutes from './routes/classes/index.js';
import eventRoutes from './routes/events/index.js';

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
passport.use(strategy);
app.use(passport.initialize());

// Mount routes
app.use('/', mainRouter);
app.use('/api/v1/courses', authenticate, courseRoutes);
app.use('/api/v1/users', authenticate, userRoutes);
app.use('/api/v1/classes', authenticate, classRoutes);
app.use('/api/v1/events', authenticate, eventRoutes);

export default app;
