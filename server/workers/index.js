const logger = require('../utils/logger');
const emailWorker = require('./emailWorker');

const initWorkers = () => {
  logger.info('Initializing Background Workers...');
  
  // Workers start listening automatically when instantiated, 
  // but we can add more logic here if needed (e.g. pause/resume)
  
  emailWorker.on('ready', () => {
    logger.info('Email Worker is ready');
  });
};

module.exports = { initWorkers };
