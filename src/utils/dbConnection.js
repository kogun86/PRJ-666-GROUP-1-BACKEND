import mongoose from 'mongoose';

import logger from './logger.js';
import config from '../config.js';

let isConnected = false;
let retryCount = 0;
const MAX_RETRIES = 5;
const RETRY_DELAY = 2000;

/**
 * Establishes a connection to the MongoDB database.
 * If a connection already exists and is ready, it returns the existing connection.
 * Otherwise, it attempts to establish a new connection.
 *
 * @throws {Error} If the MongoDB URL is not defined in the configuration.
 * @returns {Promise<mongoose.Connection>|null>} Resolves with the Mongoose connection object if successful, or null if all retries fail.
 */
async function connectDB() {
  if (!config.MONGO_URL) {
    logger.error('MongoDB URL is not defined in the configuration.');
    throw new Error('MongoDB URL is not defined in the configuration.');
  }

  // If the connection is already established, return the existing connection
  if (isConnected && mongoose.connection.readyState == 1) {
    logger.info('Using existing MongoDB connection');
    return mongoose.connection;
  }

  // If the connection is not established, attempt to connect
  return attemptConnection();
}

/**
 * Attempts to establish a connection to the MongoDB database using Mongoose.
 * If a connection already exists, it will be closed before reconnecting.
 * Retries the connection on failure up to a maximum number of attempts, with a delay between retries.
 *
 * @async
 * @function attemptConnection
 * @returns {Promise<import('mongoose').Mongoose|null>} Resolves with the Mongoose connection object if successful, or null if all retries fail.
 */
async function attemptConnection() {
  try {
    // If the connection is already established, close it before reconnecting
    // This is to ensure that we are not trying to connect to a closed connection
    if (mongoose.connection.readyState != 0) {
      logger.info('Closing existing MongoDB connection');
      await mongoose.disconnect();
    }

    // Attempt to connect to the MongoDB database
    logger.info('Attempting to connect to MongoDB');
    const db = await mongoose.connect(config.MONGO_URL);

    // Set the connection state to connected
    isConnected = db.connections[0].readyState == 1;
    logger.info('MongoDB connection established');

    retryCount = 0;

    return db;
  } catch (err) {
    retryCount++;
    logger.error({ err }, `MongoDB connection attempt ${retryCount} failed`);

    if (retryCount < MAX_RETRIES) {
      logger.info(`Retrying connection in ${RETRY_DELAY / 1000} seconds`);

      // Wait for a specified delay before retrying
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));

      return attemptConnection();
    } else {
      logger.error('Max retries reached. Could not connect to MongoDB.');

      return null;
    }
  }
}

export { connectDB };
