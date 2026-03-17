const BaseRepository = require('./BaseRepository');
const Habit = require('../models/Habit');

class HabitRepository extends BaseRepository {
  constructor() {
    super(Habit);
  }

  async findActiveByUserId(userId) {
    return this.model.find({ userId, isActive: true }).sort('-createdAt');
  }

  async findOneWithUser(habitId, userId) {
    return this.model.findOne({ _id: habitId, userId });
  }

  async countActive(userId) {
    return this.model.countDocuments({ userId, isActive: true });
  }
}

module.exports = new HabitRepository();
