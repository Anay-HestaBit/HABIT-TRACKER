const express = require('express');
const router = express.Router();
const habitController = require('../controllers/habitController');
const { protect } = require('../middleware/auth');

// @route   GET /api/habits
router.get('/', protect, habitController.getHabits.bind(habitController));

// @route   POST /api/habits
router.post('/', protect, habitController.createHabit.bind(habitController));

// @route   PUT /api/habits/:id
router.put('/:id', protect, habitController.updateHabit.bind(habitController));

// @route   DELETE /api/habits/:id
router.delete('/:id', protect, habitController.deleteHabit.bind(habitController));

// @route   POST /api/habits/:id/complete
router.post('/:id/complete', protect, habitController.completeHabit.bind(habitController));

module.exports = router;
