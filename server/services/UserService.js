const UserRepository = require('../repositories/UserRepository');
const HabitRepository = require('../repositories/HabitRepository');
const ProgressRepository = require('../repositories/ProgressRepository');
const logger = require('../utils/logger');

class UserService {
  async deleteUserAccount(userId) {
    logger.info(`Deleting user account: ${userId}`);
    
    // Delete all related data
    await HabitRepository.model.deleteMany({ userId });
    await ProgressRepository.model.deleteMany({ userId });
    
    // Delete the user
    return await UserRepository.deleteById(userId);
  }

  async updateProfile(userId, updateData) {
    logger.info(`Updating profile for user: ${userId}`);
    return await UserRepository.update(userId, updateData);
  }
}

module.exports = new UserService();
