const config = {
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  PORT: process.env.PORT || 8080,
  MONGO_URL: process.env.MONGO_URL || null,
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || null,
  CLOUDINARY: {
    CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || null,
    API_KEY: process.env.CLOUDINARY_API_KEY || null,
    API_SECRET: process.env.CLOUDINARY_API_SECRET || null,
  },
};

export default config;
