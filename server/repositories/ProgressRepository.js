const BaseRepository = require('./BaseRepository');
const Progress = require('../models/Progress');

class ProgressRepository extends BaseRepository {
  constructor() {
    super(Progress);
  }

  async findByUserAndDate(userId, date) {
    return this.model.findOne({ userId, date });
  }

  async findByUserAndDateRange(userId, startDate, endDate) {
    return this.model.find({
      userId,
      date: { $gte: startDate, $lte: endDate }
    }).sort('date');
  }

  async findStats(userId, limit = 7) {
    return this.model.find({ userId }).sort('-date').limit(limit);
  }
}

module.exports = new ProgressRepository();
