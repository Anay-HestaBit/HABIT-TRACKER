const express = require('express');
const router = express.Router();
const habitController = require('../controllers/habitController');
const { protect } = require('../middleware/auth');

// @route   GET /api/habits
router.get('/', protect, habitController.getHabits.bind(habitController));

// @route   POST /api/habits
router.post('/', protect, habitController.createHabit.bind(habitController));

// @route   POST /api/habits/bulk
router.post('/bulk', protect, habitController.createHabitsBulk.bind(habitController));

// @route   PUT /api/habits/:id
router.put('/:id', protect, habitController.updateHabit.bind(habitController));

// @route   DELETE /api/habits/:id
router.delete('/:id', protect, habitController.deleteHabit.bind(habitController));

// @route   POST /api/habits/:id/complete
router.post('/:id/complete', protect, habitController.completeHabit.bind(habitController));

// @route   POST /api/habits/:id/shield
router.post('/:id/shield', protect, habitController.useStreakShield.bind(habitController));

module.exports = router;
