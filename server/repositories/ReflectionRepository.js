const BaseRepository = require('./BaseRepository');
const Reflection = require('../models/Reflection');

class ReflectionRepository extends BaseRepository {
  constructor() {
    super(Reflection);
  }

  async findByUserId(userId) {
    return this.model.find({ userId }).sort('-date');
  }
}

module.exports = new ReflectionRepository();
