const { createBullBoard } = require('@bull-board/api');
const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter');
const { ExpressAdapter } = require('@bull-board/express');
const emailQueue = require('../queues/emailQueue');
const express = require('express');

const router = express.Router();

// FIX: The original admin route had NO authentication — anyone could visit
// /admin/queues and see all email job data, retry/delete jobs, etc.
// Now protected by a secret token set via ADMIN_SECRET env var.
// Access: /admin/queues?token=YOUR_ADMIN_SECRET
const adminAuth = (req, res, next) => {
  const headerToken = req.headers['x-admin-token'];
  const queryToken = req.query.token;
  const secret = process.env.ADMIN_SECRET;

  if (!secret) {
    // In development without a secret configured, allow access
    if (process.env.NODE_ENV !== 'production') return next();
    return res.status(503).json({ message: 'Admin panel is not configured' });
  }

  if (queryToken) {
    return res.status(401).json({ message: 'Unauthorized: use x-admin-token header' });
  }

  const token = headerToken;
  if (token !== secret) {
    return res.status(401).json({ message: 'Unauthorized: invalid admin token' });
  }

  next();
};

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [new BullMQAdapter(emailQueue)],
  serverAdapter,
});

router.use(adminAuth, serverAdapter.getRouter());

module.exports = router;
