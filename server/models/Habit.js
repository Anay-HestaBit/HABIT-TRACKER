const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Habit name is required'],
    trim: true,
    maxlength: [100, 'Habit name must be at most 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description must be at most 500 characters'],
    default: ''
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly'],
    default: 'daily'
  },
  streak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  completions: [{
    date: { type: Date, required: true },
    completedAt: { type: Date, default: Date.now }
  }],
  color: {
    type: String,
    default: '#8B5CF6'
  },
  icon: {
    type: String,
    default: 'star'
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Prevent duplicate completions on the same day
habitSchema.methods.isCompletedToday = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return this.completions.some(c => {
    const completionDate = new Date(c.date);
    completionDate.setHours(0, 0, 0, 0);
    return completionDate.getTime() === today.getTime();
  });
};

// Calculate streak
habitSchema.methods.calculateStreak = function() {
  if (this.completions.length === 0) return 0;

  const sorted = [...this.completions]
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let checkDate = new Date(today);

  for (let i = 0; i < sorted.length; i++) {
    const completionDate = new Date(sorted[i].date);
    completionDate.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((checkDate - completionDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (diffDays === 1) {
      streak++;
      checkDate = new Date(completionDate);
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};

module.exports = mongoose.model('Habit', habitSchema);
