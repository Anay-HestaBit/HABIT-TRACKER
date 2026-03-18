const nodemailer = require('nodemailer');
const dns = require('dns');
const logger = require('./logger');

const resolveSmtpHost = async (host) => {
  const lookup = await dns.promises.lookup(host, { family: 4 });
  return lookup.address;
};

const sendEmail = async (options) => {
  try {
    const smtpHost = process.env.SMTP_HOST;
    const resolvedHost = await resolveSmtpHost(smtpHost);
    const port = Number(process.env.SMTP_PORT);

    const transporter = nodemailer.createTransport({
      host: resolvedHost,
      port,
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        servername: smtpHost,
      },
    });

    const message = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html,
    };

    const info = await transporter.sendMail(message);
    logger.info(`Email sent: ${info.messageId}`);
  } catch (error) {
    logger.error('Email sending failed:', error);
    throw new Error('Email could not be sent');
  }
};

module.exports = sendEmail;
