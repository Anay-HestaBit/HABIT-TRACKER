const ReflectionService = require('../services/ReflectionService');
const logger = require('../utils/logger');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

class ReflectionController {
  async getReflections(req, res, next) {
    try {
      const reflections = await ReflectionService.getUserReflections(req.user._id);
      res.json(reflections);
    } catch (error) {
      logger.error('Error fetching reflections:', error);
      next(error);
    }
  }

  async createReflection(req, res, next) {
    try {
      const reflection = await ReflectionService.createReflection(req.user._id, req.body);
      res.status(201).json(reflection);
    } catch (error) {
      logger.error('Error creating reflection:', error);
      next(error);
    }
  }

  async getStatus(req, res, next) {
    try {
      const user = await User.findById(req.user._id).select('journalPasswordHash');
      res.json({ hasPassword: Boolean(user?.journalPasswordHash) });
    } catch (error) {
      next(error);
    }
  }

  async setPassword(req, res, next) {
    try {
      const { password } = req.body;
      if (!password || password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters' });
      }
      const user = await User.findById(req.user._id).select('journalPasswordHash');
      if (user?.journalPasswordHash) {
        return res.status(400).json({ message: 'Journal password already set' });
      }
      const salt = await bcrypt.genSalt(12);
      const hash = await bcrypt.hash(password, salt);
      await User.findByIdAndUpdate(req.user._id, {
        journalPasswordHash: hash,
        journalPasswordSetAt: new Date(),
      });
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  async verifyPassword(req, res, next) {
    try {
      const { password } = req.body;
      const user = await User.findById(req.user._id).select('journalPasswordHash');
      if (!user?.journalPasswordHash) {
        return res.status(403).json({ message: 'Journal password not set' });
      }
      const ok = await bcrypt.compare(password || '', user.journalPasswordHash);
      if (!ok) {
        return res.status(401).json({ message: 'Invalid journal password' });
      }
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReflectionController();
