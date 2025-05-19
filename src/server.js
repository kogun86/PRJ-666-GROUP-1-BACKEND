import stoppable from 'stoppable';

import app from './app.js';
import config from './config.js';
import logger from './utils/logger.js';
import { connectDB } from './utils/dbConnection.js';

let server = null;

// Start server
connectDB()
  .finally(() => {
    server = stoppable(
      app.listen(config.PORT, () => {
        logger.info(`Server is running on port ${config.PORT}`);
      })
    );
  })
  .catch((err) => {
    logger.error({ err }, 'Failed to connect to MongoDB');
    process.exit(1);
  });

export default server;
