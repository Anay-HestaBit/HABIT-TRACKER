const Redis = require('ioredis');
const logger = require('./logger');

let redisUrl = (process.env.REDIS_URL || 'redis://127.0.0.1:6379').trim();

// Handle common copy-paste errors from CLI commands
if (redisUrl.includes(' -u ')) {
  redisUrl = redisUrl.split(' -u ')[1];
} else if (redisUrl.startsWith('redis-cli')) {
  const parts = redisUrl.split(' ');
  redisUrl = parts[parts.length - 1];
}

const redisConnection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  connectTimeout: 10000,
  keepAlive: 10000,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redisConnection.on('connect', () => {
  logger.info('Connected to Redis');
});

redisConnection.on('error', (error) => {
  logger.error('Redis connection error:', error);
});

module.exports = redisConnection;
