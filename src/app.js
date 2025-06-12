import cors from 'cors';
import helmet from 'helmet';
import pino from 'pino-http';
import express from 'express';
import passport from 'passport';
import swaggerUi from 'swagger-ui-express';

import authenticate from './core/auth.js';
import { strategy } from './core/auth.js';
import swaggerSpec from './core/swagger/swagger.js';
import logger from './shared/utils/logger.js';

import mainRouter from './features/health/routes/index.js';
import courseRoutes from './features/courses/routes/index.js';
import userRoutes from './features/users/routes/index.js';
import classRoutes from './features/classes/routes/index.js';
import eventRoutes from './features/events/routes/index.js';
import chatRoutes from './features/chat/routes/index.js';
import todoRoutes from './features/todo/routes/index.js';
import tipsRoutes from './features/tips/index.js';
import goalRoutes from './features/goals/routes/index.js';
import profileRoutes from './features/profile/routes/index.js';

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
app.use('/api/v1/', mainRouter);
app.use('/api/v1/courses', authenticate, courseRoutes);
app.use('/api/v1/users', authenticate, userRoutes);
app.use('/api/v1/classes', authenticate, classRoutes);
app.use('/api/v1/events', authenticate, eventRoutes);
app.use('/api/v1/chat', authenticate, chatRoutes);
app.use('/api/v1/smart-todo', authenticate, todoRoutes);
app.use('/api/v1/tips', authenticate, tipsRoutes);
app.use('/api/v1/goals', authenticate, goalRoutes);
app.use('/api/v1/profile', authenticate, profileRoutes);

// Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default app;
