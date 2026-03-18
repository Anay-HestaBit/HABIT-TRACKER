const { Worker } = require('bullmq');
const sendEmail = require('../utils/sendEmail');
const { createClient } = require('../utils/redis');
const logger = require('../utils/logger');
const { maskEmail } = require('../utils/sanitize');

const emailWorker = new Worker(
  'email-queue',
  async (job) => {
    // FIX: Destructure 'html' from job data — all email templates in AuthService
    // send rich HTML but the original worker only passed text, so all emails
    // arrived with no formatting/styling.
    const { email, subject, message, html } = job.data;
    logger.info(`Processing email job: ${job.id} (${job.name}) for ${maskEmail(email)}`);

    try {
      await sendEmail({ email, subject, message, html });
      logger.info(`Successfully sent email to ${maskEmail(email)}`);
    } catch (error) {
      logger.error(`Error sending email for ${maskEmail(email)}:`, error);
      throw error; // BullMQ retries based on queue settings (3 attempts, exponential backoff)
    }
  },
  {
    connection: createClient(true),
    concurrency: 5,
  }
);

emailWorker.on('completed', (job) => {
  logger.info(`Email job ${job.id} completed`);
});

emailWorker.on('failed', (job, err) => {
  logger.error(`Email job ${job.id} failed: ${err.message}`);
});

emailWorker.on('error', (err) => {
  logger.error('Email worker error:', err);
});

module.exports = emailWorker;
