const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  
  res.status(500).json({
    success: false,
    error: err.message || 'Server Error'
  });
};

module.exports = { errorHandler };
