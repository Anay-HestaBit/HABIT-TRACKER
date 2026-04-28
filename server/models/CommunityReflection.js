const mongoose = require('mongoose');

const communityReflectionSchema = new mongoose.Schema({
  communityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
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
  isPinned: { type: Boolean, default: false },
  pinnedAt: { type: Date, default: null },
  isHidden: { type: Boolean, default: false },
  hiddenAt: { type: Date, default: null },
  hiddenBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

communityReflectionSchema.index({ communityId: 1, date: 1 });

module.exports = mongoose.model('CommunityReflection', communityReflectionSchema);
