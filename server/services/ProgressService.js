const ProgressRepository = require('../repositories/ProgressRepository');
const HabitRepository = require('../repositories/HabitRepository');
const UserRepository = require('../repositories/UserRepository');
const logger = require('../utils/logger');

class ProgressService {
  async getDashboardData(userId) {
    logger.info(`Fetching dashboard data for user: ${userId}`);
    const user = await UserRepository.findById(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const progress = await ProgressRepository.findByUserAndDate(userId, today);
    const habits = await HabitRepository.findActiveByUserId(userId);
    
    // Calculate stats
    const totalHabits = habits.length;
    const habitsCompletedToday = progress ? progress.habitsCompleted : 0;
    const completionPercentage = totalHabits > 0 ? Math.round((habitsCompletedToday / totalHabits) * 100) : 0;
    
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
    const stats = await ProgressRepository.findStats(userId, 7); // Last 7 days
    return stats.reverse();
  }

  async getHeatmapData(userId) {
    logger.info(`Fetching heatmap data for user: ${userId}`);
    // For heatmap, we usually want more data, say 90 days
    return ProgressRepository.findStats(userId, 90);
  }
}

module.exports = new ProgressService();
