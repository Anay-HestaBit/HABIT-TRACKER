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

const redisOptions = {
  maxRetriesPerRequest: null,
  connectTimeout: 15000,
  keepAlive: 15000,
  enableReadyCheck: true,
  retryStrategy: (times) => {
    // Reconnect more aggressively but with a cap
    const delay = Math.min(times * 100, 3000);
    return delay;
  },
  reconnectOnError: (err) => {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      return true; // Reconnect on READONLY error
    }
    return false;
  },
};

// Upstash and some cloud providers REQUIRE tls to be set explicitly for rediss://
if (isTLS) {
  redisOptions.tls = {
    rejectUnauthorized: false, // Allows self-signed or specific cloud certs
  };
}

const redisConnection = new Redis(redisUrl, redisOptions);

redisConnection.on('connect', () => {
  logger.info('Connected to Redis');
});

redisConnection.on('error', (error) => {
  logger.error('Redis connection error:', error);
});

module.exports = redisConnection;
