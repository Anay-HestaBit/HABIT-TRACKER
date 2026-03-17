require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const ReminderService = require('./services/ReminderService');
const path = require('path');
const rateLimit = require('express-rate-limit');
const csrf = require('csurf');
const RedisStore = require('rate-limit-redis').default;
const { sharedConnection: redisConnection } = require('./utils/redis');
const logger = require('./utils/logger');
const { initWorkers } = require('./workers');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Trust proxy for cloud deployments (Render, Heroku, etc.)
if (process.env.NODE_ENV === 'production' || process.env.RENDER) {
  app.set('trust proxy', 1);
}

// Rate Limiting (Redis-backed for scalability)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again after 15 minutes',
  store: new RedisStore({
    sendCommand: (...args) => redisConnection.call(...args),
  }),
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, 
}));
app.use(limiter);
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// CSRF Protection
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

// CSRF Token route
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => logger.info('✅ MongoDB Connected'))
  .catch(err => {
    logger.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  });

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/habits', require('./routes/habits'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/users', require('./routes/users'));
app.use('/admin/queues', require('./routes/admin'));

// Base route for health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Daily Habit Journey API is running' });
});

// static files for production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'));
  });
}

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
  initWorkers();
  ReminderService.init();
});
