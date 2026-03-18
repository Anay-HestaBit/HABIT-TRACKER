const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    trim: true,
    minlength: [2, 'Username must be at least 2 characters'],
    maxlength: [30, 'Username must be at most 30 characters']
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  age: {
    type: Number,
    min: [13, 'Must be at least 13 years old'],
    max: [120, 'Invalid age']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say'],
    default: 'prefer-not-to-say'
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters']
  },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  badges: [{
    name: String,
    description: String,
    icon: String,
    unlockedAt: { type: Date, default: Date.now }
  }],
  streakShield: {
    available: { type: Boolean, default: true },
    lastUsed: { type: Date, default: null },
    resetsAt: { type: Date, default: null }
  },
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
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  verificationTokenExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  otpCode: String,
  otpExpire: Date,
  bio: { type: String, maxlength: [200, 'Bio cannot exceed 200 characters'] },
  profilePicUrl: { type: String, default: null },
  journalPasswordHash: { type: String, default: null },
  journalPasswordSetAt: { type: Date, default: null },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate verification token
userSchema.methods.generateVerificationToken = function() {
  const token = require('crypto').randomBytes(32).toString('hex');
  this.verificationToken = require('crypto').createHash('sha256').update(token).digest('hex');
  this.verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return token;
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
