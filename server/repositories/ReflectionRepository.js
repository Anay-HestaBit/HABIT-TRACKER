const BaseRepository = require('./BaseRepository');
const Reflection = require('../models/Reflection');

class ReflectionRepository extends BaseRepository {
  constructor() {
    super(Reflection);
  }

  async findByUserId(userId) {
    return this.model.find({ userId }).sort('-date');
  }

  async findRecentByUserId(userId, limit = 3) {
    return this.model.find({ userId }).sort('-date').limit(limit);
  }
}

module.exports = new ReflectionRepository();
