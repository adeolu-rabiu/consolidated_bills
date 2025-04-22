const express = require('express');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const { connectRedis } = require('./config/redis');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const invoiceRoutes = require('./routes/invoice');
const { errorHandler } = require('./middleware/error');
const logger = require('./utils/logger');
const { register } = require('./utils/metrics'); // 🔥 Prometheus metrics import

// Load environment variables
dotenv.config();

// Init Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Connect to database
connectDB();

// Connect to Redis
connectRedis();

// Metrics endpoint for Prometheus
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/invoices', invoiceRoutes);

// Error handler
app.use(errorHandler);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});


// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

module.exports = app;

