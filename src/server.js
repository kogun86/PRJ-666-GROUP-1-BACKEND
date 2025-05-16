import stoppable from 'stoppable';

import app from './app.js';
import config from './config.js';
import logger from './utils/logger.js';

// Start server
const server = stoppable(
  app.listen(config.PORT, () => {
    logger.info(`Server is running on port ${config.PORT}`);
  })
);

export default server;
