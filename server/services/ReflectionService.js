const ReflectionRepository = require('../repositories/ReflectionRepository');
const logger = require('../utils/logger');

class ReflectionService {
  async getUserReflections(userId) {
    logger.info(`Fetching reflections for user: ${userId}`);
    return ReflectionRepository.findByUserId(userId);
  }

  async createReflection(userId, data) {
    const payload = {
      userId,
      content: data.content,
      mood: data.mood || 'okay',
      date: data.date ? new Date(data.date) : new Date(),
      habitId: data.habitId || null,
    };
    return ReflectionRepository.create(payload);
  }
}

module.exports = new ReflectionService();
