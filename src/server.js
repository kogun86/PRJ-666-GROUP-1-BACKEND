import stoppable from 'stoppable';

import app from './app.js';
import config from './config.js';
import logger from './shared/utils/logger.js';
import { connectDB } from './core/dbConnection.js';
import { hydrateCognitoJwks } from './core/auth.js';

// Initialize database and auth when the module is imported
connectDB()
  .then(hydrateCognitoJwks)
  .catch((err) => {
    logger.error({ err }, 'Failed to connect to MongoDB');
  });

// For local development, we still want to run the server
if (process.env.NODE_ENV !== 'production') {
  const server = stoppable(
    app.listen(config.PORT, () => {
      logger.info(`Server is running on port ${config.PORT}`);
    })
  );
}

// Export the Express app for Vercel
export default app;
