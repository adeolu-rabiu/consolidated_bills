const Redis = require('redis');
const logger = require('../utils/logger');

const connectRedis = async () => {
  try {
    const client = Redis.createClient({
      url: process.env.REDIS_URL || 'redis://redis:6379'
    });
    
    client.on('error', (err) => {
      logger.error(`Redis Error: ${err}`);
    });
    
    return client;
  } catch (error) {
    logger.error(`Redis connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { connectRedis };
