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

const isTLS = redisUrl.startsWith('rediss://');

/**
 * Creates a new Redis client instance
 * @param {boolean} isBlocking - If true, optimized for BullMQ blocking commands
 */
const createClient = (isBlocking = false) => {
  const options = {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    connectTimeout: 30000,
    lazyConnect: true,          // Don't connect until needed
    enableOfflineQueue: true,   // Queue commands while disconnected
    retryStrategy: (times) => {
      // Exponential backoff with a cap
      const delay = Math.min(times * 500, 10000);
      return delay;
    },
    reconnectOnError: (err) => {
      const targetError = 'READONLY';
      if (err.message.includes(targetError)) {
        return true;
      }
      return false;
    },
  };

  if (isTLS) {
    options.tls = {}; // Use default TLS settings for Upstash
  }

  const client = new Redis(redisUrl, options);

  client.on('error', (error) => {
    // Only log if not a standard disconnect
    if (error.code !== 'ECONNRESET') {
      logger.error('Redis Error:', error);
    }
  });

  return client;
};

// Shared connection for non-blocking commands (Rate limiting, simple GET/SET)
const sharedConnection = createClient(false);

sharedConnection.on('connect', () => {
  logger.info('Connected to Redis (Shared)');
});

module.exports = {
  sharedConnection,
  createClient
};
