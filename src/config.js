const config = {
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  PORT: process.env.PORT || 8080,
  MONGO_URL: process.env.MONGO_URL || null,
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || null,
};

export default config;
