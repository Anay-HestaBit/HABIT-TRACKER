const { Worker } = require('bullmq');
const sendEmail = require('../utils/sendEmail');
const { createClient } = require('../utils/redis');
const logger = require('../utils/logger');

const emailWorker = new Worker(
  'email-queue',
  async (job) => {
    const { email, subject, message } = job.data;
    logger.info(`Processing email job: ${job.id} for ${email}`);
    
    try {
      await sendEmail({ email, subject, message });
      logger.info(`Successfully sent email to ${email}`);
    } catch (error) {
      logger.error(`Error sending email in worker for ${email}:`, error);
      throw error; // BullMQ will retry based on queue settings
    }
  },
  { connection: createClient(true) }
);

emailWorker.on('completed', (job) => {
  logger.info(`Email job ${job.id} completed`);
});

emailWorker.on('failed', (job, err) => {
  logger.error(`Email job ${job.id} failed with ${err.message}`);
});

module.exports = emailWorker;
