require('dotenv').config();
const mongoose = require('mongoose');
const { initWorkers } = require('./workers');
const ReminderService = require('./services/ReminderService');
const logger = require('./utils/logger');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    logger.info('✅ Worker connected to MongoDB');
    
    // Initialize background workers (BullMQ)
    initWorkers();
    
    // Initialize cron jobs
    ReminderService.init();
    
    logger.info('🚀 Background Worker is running');
  })
  .catch(err => {
    logger.error('❌ Worker MongoDB Connection Error:', err);
    process.exit(1);
  });
