import pino from 'pino';

import config from '../config.js';

const options = { level: config.LOG_LEVEL };

if (options.level === 'debug') {
  options.transport = {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  };
}

export default pino(options);
