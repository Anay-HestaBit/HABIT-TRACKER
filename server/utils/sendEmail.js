const { Resend } = require('resend');
const logger = require('./logger');

const sendEmail = async (options) => {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    const fallbackFrom = process.env.FROM_EMAIL
      ? `${process.env.FROM_NAME || 'Habitcraft'} <${process.env.FROM_EMAIL}>`
      : '';
    const from = process.env.RESEND_FROM || fallbackFrom;

    if (!apiKey || !from) {
      throw new Error('Missing RESEND_API_KEY or RESEND_FROM/FROM_EMAIL');
    }

    const resend = new Resend(apiKey);
    const payload = {
      from,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html,
    };

    const result = await resend.emails.send(payload);
    logger.info(`Email sent: ${result?.data?.id || 'unknown-id'}`);
  } catch (error) {
    logger.error('Email sending failed:', error);
    throw new Error('Email could not be sent');
  }
};

module.exports = sendEmail;
