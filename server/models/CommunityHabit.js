const mongoose = require('mongoose');

const communityHabitSchema = new mongoose.Schema({
  communityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: true,
    index: true,
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
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    completedAt: { type: Date, default: Date.now },
    shielded: { type: Boolean, default: false }
  }],
  color: { type: String, default: '#8B5CF6' },
  icon: { type: String, default: 'star' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const getUTCMidnight = () => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

communityHabitSchema.methods.isCompletedToday = function (userId) {
  const todayUTC = getUTCMidnight().getTime();
  return this.completions.some(c => {
    if (String(c.userId) !== String(userId)) return false;
    const d = new Date(c.date);
    d.setUTCHours(0, 0, 0, 0);
    return d.getTime() === todayUTC;
  });
};

communityHabitSchema.methods.calculateStreak = function () {
  if (this.completions.length === 0) return 0;

  const sorted = [...this.completions]
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  let streak = 0;
  const todayUTC = getUTCMidnight();
  let checkDate = new Date(todayUTC);

  for (let i = 0; i < sorted.length; i++) {
    const completionDate = new Date(sorted[i].date);
    completionDate.setUTCHours(0, 0, 0, 0);

    const diffDays = Math.floor(
      (checkDate.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) {
      streak++;
      checkDate.setUTCDate(checkDate.getUTCDate() - 1);
    } else if (diffDays === 1) {
      streak++;
      checkDate = new Date(completionDate);
      checkDate.setUTCDate(checkDate.getUTCDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};

module.exports = mongoose.model('CommunityHabit', communityHabitSchema);
