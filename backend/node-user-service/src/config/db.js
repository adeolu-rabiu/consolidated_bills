const mysql = require('mysql2/promise');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'mysql',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'rootpassword',
      database: process.env.DB_NAME || 'billing_app'
    });
    
    logger.info('MySQL connected');
    return connection;
  } catch (error) {
    logger.error(`Database connection error: ${error.message}`);
    return null; // Don't exit process to allow the application to start
  }
};

module.exports = { connectDB };
