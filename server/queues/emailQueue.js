const { Queue } = require('bullmq');
const redisConnection = require('../utils/redis');

const emailQueue = new Queue('email-queue', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: true,
  },
});

module.exports = emailQueue;
