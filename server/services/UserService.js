const UserRepository = require('../repositories/UserRepository');
const logger = require('../utils/logger');

class UserService {
  async deleteUserAccount(userId) {
    logger.info(`Deleting user account: ${userId}`);

    return UserRepository.update(userId, {
      isDeleted: true,
      deletedAt: new Date(),
    });
  }

  async updateProfile(userId, updateData) {
    logger.info(`Updating profile for user: ${userId}`);
    return await UserRepository.update(userId, updateData);
  }
}

module.exports = new UserService();
