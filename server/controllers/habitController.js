const HabitService = require('../services/HabitService');
const logger = require('../utils/logger');

class HabitController {
  async getHabits(req, res, next) {
    try {
      const habits = await HabitService.getUserHabits(req.user._id);
      res.json(habits);
    } catch (error) {
      logger.error('Error fetching habits:', error);
      next(error);
    }
  }

  async createHabit(req, res, next) {
    try {
      const habit = await HabitService.createHabit(req.user._id, req.body);
      res.status(201).json(habit);
    } catch (error) {
      logger.error('Error creating habit:', error);
      next(error);
    }
  }

  async updateHabit(req, res, next) {
    try {
      const habit = await HabitService.updateHabit(req.params.id, req.user._id, req.body);
      res.json(habit);
    } catch (error) {
      logger.error('Error updating habit:', error);
      next(error);
    }
  }

  async deleteHabit(req, res, next) {
    try {
      await HabitService.deleteHabit(req.params.id, req.user._id);
      res.json({ message: 'Habit removed' });
    } catch (error) {
      logger.error('Error deleting habit:', error);
      next(error);
    }
  }

  async completeHabit(req, res, next) {
    try {
      const result = await HabitService.completeHabit(req.params.id, req.user._id);
      res.json(result);
    } catch (error) {
      logger.error('Error completing habit:', error);
      if (error.message === 'Habit already completed today') {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }
}

module.exports = new HabitController();
