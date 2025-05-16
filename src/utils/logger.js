import pino from 'pino';

const options = { level: process.env.LOG_LEVEL || 'info' };

if (options.level === 'debug') {
  options.transport = {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  };
}

export default pino(options);
