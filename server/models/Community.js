const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    enum: ['owner', 'admin', 'member'],
    default: 'member',
  },
  joinedAt: { type: Date, default: Date.now },
}, { _id: false });

const pendingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  requestedAt: { type: Date, default: Date.now },
}, { _id: false });

const communitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Community name is required'],
    trim: true,
    maxlength: [60, 'Community name must be at most 60 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [240, 'Description must be at most 240 characters'],
    default: '',
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  inviteCode: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  members: [memberSchema],
  pendingRequests: [pendingSchema],
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  badges: [{
    name: String,
    description: String,
    icon: String,
    unlockedAt: { type: Date, default: Date.now }
  }],
  worldState: {
    treeLevel: { type: Number, default: 1 },
    branches: { type: Number, default: 2 },
    leaves: { type: Number, default: 5 },
    flowers: { type: Number, default: 0 },
    fruits: { type: Number, default: 0 },
    season: { type: String, default: 'spring' },
    particles: { type: Boolean, default: false },
    glowIntensity: { type: Number, default: 0.2 }
  },
  streakShield: {
    available: { type: Boolean, default: true },
    lastUsed: { type: Date, default: null },
    resetsAt: { type: Date, default: null },
  },
}, { timestamps: true });

module.exports = mongoose.model('Community', communitySchema);
