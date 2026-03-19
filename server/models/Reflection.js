const mongoose = require('mongoose');

const reflectionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true
  },
  content: {
    type: String,
    required: [true, 'Reflection content is required'],
    maxlength: [8000, 'Reflection must be at most 8000 characters']
  },
  mood: {
    type: String,
    enum: ['amazing', 'good', 'okay', 'bad', 'terrible'],
    default: 'okay'
  },
  habitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habit',
    default: null
  }
}, { timestamps: true });

reflectionSchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model('Reflection', reflectionSchema);
