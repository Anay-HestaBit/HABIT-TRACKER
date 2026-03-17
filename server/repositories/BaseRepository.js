class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async find(query = {}, options = {}) {
    return this.model.find(query, null, options);
  }

  async findOne(query) {
    return this.model.findOne(query);
  }

  async findById(id) {
    return this.model.findById(id);
  }

  async create(data) {
    return this.model.create(data);
  }

  async updateOne(query, data, options = { new: true }) {
    return this.model.findOneAndUpdate(query, data, options);
  }

  async updateById(id, data, options = { new: true }) {
    return this.model.findByIdAndUpdate(id, data, options);
  }

  async count(query) {
    return this.model.countDocuments(query);
  }

  async deleteById(id) {
    return this.model.findByIdAndDelete(id);
  }
}

module.exports = BaseRepository;
