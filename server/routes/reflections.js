const express = require('express');
const router = express.Router();
const reflectionController = require('../controllers/reflectionController');
const { protect } = require('../middleware/auth');
const { requireJournalPassword } = require('../middleware/journalAuth');

// @route   GET /api/reflections/status
router.get('/status', protect, reflectionController.getStatus.bind(reflectionController));

// @route   POST /api/reflections/set-password
router.post('/set-password', protect, reflectionController.setPassword.bind(reflectionController));

// @route   POST /api/reflections/verify
router.post('/verify', protect, reflectionController.verifyPassword.bind(reflectionController));

// @route   GET /api/reflections
router.get('/', protect, requireJournalPassword, reflectionController.getReflections.bind(reflectionController));

// @route   POST /api/reflections
router.post('/', protect, requireJournalPassword, reflectionController.createReflection.bind(reflectionController));

module.exports = router;
