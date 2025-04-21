const client = require('prom-client');

// Create a Registry to register the metrics
const register = new client.Registry();

// Add a default label to all metrics
client.register.setDefaultLabels({
  app: 'user-service'
});

// Define metrics
const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

// Register the metrics
register.registerMetric(httpRequestDurationMicroseconds);

// Enable the default metrics
client.collectDefaultMetrics({ register });

module.exports = { register, httpRequestDurationMicroseconds };
