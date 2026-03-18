const cron = require('node-cron');
const UserRepository = require('../repositories/UserRepository');
const HabitRepository = require('../repositories/HabitRepository');
const emailQueue = require('../queues/emailQueue');
const logger = require('../utils/logger');
const { maskEmail } = require('../utils/sanitize');

class ReminderService {
  init() {
    // Schedule reminders every day at 8 PM (20:00)
    cron.schedule('0 20 * * *', () => {
      this.sendDailyReminders();
    });
    logger.info('Reminder service initialized (Daily at 8 PM)');
  }

  getUTCMidnight() {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    return d;
  }

  isCompletedOnDate(completionDate, targetDate) {
    const d = new Date(completionDate);
    d.setUTCHours(0, 0, 0, 0);
    return d.getTime() === targetDate.getTime();
  }

  async sendDailyReminders() {
    logger.info('Checking for users to send daily reminders...');
    try {
      const users = await UserRepository.model.find({});
      
      for (const user of users) {
        if (!user.isVerified) continue;
        
        const habits = await HabitRepository.findActiveByUserId(user._id);
        const today = this.getUTCMidnight();
        
        const uncompletedHabits = habits.filter(habit => {
          return !habit.completions?.some(c => this.isCompletedOnDate(c.date, today));
        });

        if (uncompletedHabits.length > 0) {
          await this.sendReminderEmail(user, uncompletedHabits);
        }
      }
    } catch (error) {
      logger.error('Error in daily reminder job:', error);
    }
  }

  async sendReminderEmail(user, habits) {
    const habitList = habits.map(h => `- ${h.name}`).join('\n');
    const message = `
      Hi ${user.fullName.split(' ')[0]},
      
      You're doing great on your journey, but you still have some habits to complete today:
      
      ${habitList}
      
      Don't let your streak break! A few minutes now will keep your world thriving.
      
      Go to your dashboard: ${process.env.CLIENT_URL}/dashboard
      
      Keep going,
      The Antigravity Team
    `;

    try {
      await emailQueue.add('reminder-email', {
        email: user.email,
        subject: '🚀 Don\'t break your streak! Daily Habit Reminder',
        message
      });
      logger.info(`Reminder email job queued for ${maskEmail(user.email)}`);
    } catch (err) {
      logger.error(`Failed to queue reminder for ${maskEmail(user.email)}:`, err);
    }
  }
}

module.exports = new ReminderService();
