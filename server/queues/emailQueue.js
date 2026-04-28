if (process.env.NODE_ENV === 'test') {
  module.exports = {
    add: async () => {},
    close: async () => {},
  };
} else {
  const { Queue } = require('bullmq');
  const { createClient } = require('../utils/redis');

  const emailQueue = new Queue('email-queue', {
    connection: createClient(true),
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
}
