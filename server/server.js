require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const ReminderService = require('./services/ReminderService');
const path = require('path');
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis').default;
const { getSharedConnection } = require('./utils/redis');
const logger = require('./utils/logger');
const { initWorkers } = require('./workers');
const errorHandler = require('./middleware/errorHandler');

const app = express();

if (process.env.NODE_ENV === 'production' || process.env.RENDER) {
  app.set('trust proxy', 1);
}

const normalize = (url) => url?.replace(/\/$/, '');

const envOrigins = (process.env.CLIENT_URLS || process.env.CLIENT_URL || '')
  .split(',')
  .map(origin => normalize(origin.trim()))
  .filter(Boolean);

const allowedOrigins = [
  ...envOrigins
].map(normalize);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const cleanOrigin = normalize(origin);

    if (allowedOrigins.includes(cleanOrigin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-journal-password'],
}));

app.options('*', cors());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args) => getSharedConnection().call(...args),
  }),
});

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads'), { maxAge: '1y' }));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => logger.info('MongoDB Connected'))
  .catch(err => {
    logger.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

app.use('/api/auth', require('./routes/auth'));
app.use('/api/habits', require('./routes/habits'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/reflections', require('./routes/reflections'));
app.use('/api/users', require('./routes/users'));
app.use('/admin/queues', require('./routes/admin'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Habitcraft API is running' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
  initWorkers();
  ReminderService.init();
});