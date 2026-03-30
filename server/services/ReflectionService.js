const ReflectionRepository = require('../repositories/ReflectionRepository');
const logger = require('../utils/logger');
const { decryptText, encryptText } = require('../utils/journalCrypto');

class ReflectionService {
  async getUserReflections(userId) {
    logger.info(`Fetching reflections for user: ${userId}`);
    const reflections = await ReflectionRepository.findByUserId(userId);
    return reflections.map(reflection => ({
      ...reflection.toObject(),
      content: decryptText(reflection.content),
    }));
  }

  async createReflection(userId, data) {
    const encryptedContent = encryptText(data.content || '');
    const payload = {
      userId,
      content: encryptedContent,
      mood: data.mood || 'okay',
      date: data.date ? new Date(data.date) : new Date(),
      habitId: data.habitId || null,
    };
    const reflection = await ReflectionRepository.create(payload);
    return {
      ...reflection.toObject(),
      content: decryptText(reflection.content),
    };
  }
}

module.exports = new ReflectionService();
