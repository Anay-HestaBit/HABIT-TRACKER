const express = require('express');
const router = express.Router();
const userService = require('../services/UserService');
const { protect } = require('../middleware/auth');
const logger = require('../utils/logger');

router.delete('/me', protect, async (req, res) => {
  try {
    await userService.deleteUserAccount(req.user._id);
    logger.info(`User ${req.user.username} deleted their account`);
    
    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting account: ${error.message}`);
    res.status(500).json({ message: 'Failed to delete account' });
  }
});

router.patch('/tour', protect, async (req, res) => {
  try {
    const user = await require('../models/User').findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.hasCompletedTour = true;
    await user.save();
    res.json({ success: true });
  } catch (err) {
    logger.error(`Error updating tour state: ${err.message}`);
    res.status(500).json({ message: 'Failed to update tour tracking' });
  }
});

module.exports = router;
