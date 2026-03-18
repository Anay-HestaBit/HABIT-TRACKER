const bcrypt = require('bcryptjs');
const User = require('../models/User');

const requireJournalPassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('journalPasswordHash');
    if (!user?.journalPasswordHash) {
      return res.status(403).json({ message: 'Journal password not set' });
    }
    const password = req.headers['x-journal-password'];
    if (!password) {
      return res.status(401).json({ message: 'Journal password required' });
    }
    const ok = await bcrypt.compare(password, user.journalPasswordHash);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid journal password' });
    }
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { requireJournalPassword };
