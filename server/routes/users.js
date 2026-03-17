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

module.exports = router;
