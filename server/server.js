require('dotenv').config();
const http = require('http');
const logger = require('./utils/logger');
const ReminderService = require('./services/ReminderService');
const { initWorkers } = require('./workers');
const { app, connectDb } = require('./app');
const { initSocket } = require('./socket');

const PORT = process.env.PORT || 5001;

connectDb()
  .then(() => {
    logger.info('MongoDB Connected');
    const server = http.createServer(app);
    initSocket(server);
    server.listen(PORT, '0.0.0.0', () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      initWorkers();
      ReminderService.init();
    });
  })
  .catch((err) => {
    logger.error('MongoDB Connection Error:', err);
    process.exit(1);
  });
