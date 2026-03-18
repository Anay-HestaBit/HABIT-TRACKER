const ProgressRepository = require('../repositories/ProgressRepository');
const HabitRepository = require('../repositories/HabitRepository');
const UserRepository = require('../repositories/UserRepository');
const logger = require('../utils/logger');

const getUTCMidnight = () => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

class ProgressService {
  async getDashboardData(userId) {
    logger.info(`Fetching dashboard data for user: ${userId}`);
    const user = await UserRepository.findById(userId);
    const today = getUTCMidnight(); // FIX: was setHours (local), now setUTCHours

    const progress = await ProgressRepository.findByUserAndDate(userId, today);
    const habits = await HabitRepository.findActiveByUserId(userId);

    const totalHabits = habits.length;
    const habitsCompletedToday = progress ? progress.habitsCompleted : 0;
    const completionPercentage = totalHabits > 0
      ? Math.round((habitsCompletedToday / totalHabits) * 100)
      : 0;

    const maxStreak = habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);

    return {
      user,
      habitsCompletedToday,
      totalHabits,
      completionPercentage,
      maxStreak,
      xp: user.xp,
      level: user.level
    };
  }

  async getChartData(userId) {
    logger.info(`Fetching chart data for user: ${userId}`);
    const stats = await ProgressRepository.findStats(userId, 7);
    return stats.reverse();
  }

  async getHeatmapData(userId, year) {
    logger.info(`Fetching heatmap data for user: ${userId} for year: ${year}`);
    const startDate = new Date(Date.UTC(year, 0, 1));  // FIX: use UTC dates
    const endDate = new Date(Date.UTC(year, 11, 31));
    return ProgressRepository.findByUserAndDateRange(userId, startDate, endDate);
  }
}

module.exports = new ProgressService();