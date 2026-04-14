const cron = require('node-cron');
const UserRepository = require('../repositories/UserRepository');
const HabitRepository = require('../repositories/HabitRepository');
const emailQueue = require('../queues/emailQueue');
const logger = require('../utils/logger');
const { maskEmail } = require('../utils/sanitize');

const IST_TIMEZONE = 'Asia/Kolkata';

const getISTCalendarDate = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: IST_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const year = Number(parts.find(p => p.type === 'year')?.value);
  const month = Number(parts.find(p => p.type === 'month')?.value);
  const day = Number(parts.find(p => p.type === 'day')?.value);
  return { year, month, day };
};

const toISTDayAnchorUTC = (date = new Date()) => {
  const { year, month, day } = getISTCalendarDate(date);
  return new Date(Date.UTC(year, month - 1, day));
};

class ReminderService {
  constructor() {
    this.isInitialized = false;
    this.reminderTask = null;
  }

  init() {
    if (this.isInitialized) {
      logger.warn('Reminder service already initialized. Skipping duplicate cron registration.');
      return;
    }

    // Schedule reminders every day at 10 AM IST and 8 PM IST.
    this.reminderTask = cron.schedule('0 10,20 * * *', () => {
      this.sendDailyReminders();
    }, {
      timezone: IST_TIMEZONE,
    });

    this.isInitialized = true;
    logger.info('Reminder service initialized (Daily at 10:00 and 20:00 Asia/Kolkata)');
  }

  getISTDayAnchor(date = new Date()) {
    return toISTDayAnchorUTC(date);
  }

  isCompletedOnISTDate(completionDate, targetDate) {
    const d = toISTDayAnchorUTC(completionDate);
    return d.getTime() === targetDate.getTime();
  }

  async sendDailyReminders() {
    logger.info('Checking for users to send daily reminders (timezone: Asia/Kolkata)...');
    try {
      const users = await UserRepository.model.find({});
      let queuedCount = 0;
      
      for (const user of users) {
        try {
          if (!user.isVerified) continue;

          const habits = await HabitRepository.findActiveByUserId(user._id);
          const today = this.getISTDayAnchor();

          const uncompletedHabits = habits.filter(habit => {
            return !habit.completions?.some(c => this.isCompletedOnISTDate(c.date, today));
          });

          if (uncompletedHabits.length > 0) {
            const queued = await this.sendReminderEmail(user, uncompletedHabits);
            if (queued) queuedCount += 1;
          }
        } catch (userError) {
          logger.error(`Failed processing reminder eligibility for ${maskEmail(user?.email || '')}:`, userError);
        }
      }

      logger.info(`Daily reminder scan complete. Queued reminders for ${queuedCount} user(s).`);
    } catch (error) {
      logger.error('Error in daily reminder job:', error);
    }
  }

  async sendReminderEmail(user, habits) {
    const firstName = (user.fullName || user.username || 'there').trim().split(/\s+/)[0] || 'there';
    const habitList = habits.map(h => `- ${h.name}`).join('\n');
    const dashboardUrl = process.env.CLIENT_URL
      ? `${process.env.CLIENT_URL}/dashboard`
      : 'your Habitcraft dashboard';

    const message = `
      Hi ${firstName},
      
      You're doing great on your journey, but you still have some habits to complete today:
      
      ${habitList}
      
      Don't let your streak break! A few minutes now will keep your world thriving.
      
      Go to your dashboard: ${dashboardUrl}
      
      Keep going,
      The Habitcraft Team
    `;

    try {
      await emailQueue.add('reminder-email', {
        email: user.email,
        subject: '🚀 Don\'t break your streak! Daily Habit Reminder',
        message
      });
      logger.info(`Reminder email job queued for ${maskEmail(user.email)}`);
      return true;
    } catch (err) {
      logger.error(`Failed to queue reminder for ${maskEmail(user.email)}:`, err);
      return false;
    }
  }
}

module.exports = new ReminderService();
