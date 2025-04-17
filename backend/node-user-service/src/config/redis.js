const { createClient } = require('redis');
const logger = require('../utils/logger');

let client;

const connectRedis = async () => {
  try {
    client = createClient({
      url: process.env.REDIS_URL
    });
    
    await client.connect();
    logger.info('Redis connected');
    return client;
  } catch (err) {
    logger.error('Redis connection error:', err);
    process.exit(1);
  }
};

const getRedis = () => {
  if (!client) {
    throw new Error('Redis not initialized');
  }
  return client;
};

module.exports = { connectRedis, getRedis };
