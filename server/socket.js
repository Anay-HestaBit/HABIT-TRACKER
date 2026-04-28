const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const CommunityService = require('./services/CommunityService');
const CommunityMessage = require('./models/CommunityMessage');
const { app } = require('./app');

let ioInstance = null;

const RATE_LIMIT_WINDOW_MS = 5000;
const RATE_LIMIT_MAX = 6;

const parseCookies = (cookieHeader = '') => {
  const cookies = {};
  cookieHeader.split(';').forEach((part) => {
    const [key, ...rest] = part.trim().split('=');
    if (!key) return;
    cookies[key] = decodeURIComponent(rest.join('='));
  });
  return cookies;
};

const initSocket = (server) => {
  if (ioInstance) return ioInstance;

  const allowedOrigins = app?.locals?.allowedOrigins || [];

  ioInstance = new Server(server, {
    cors: {
      origin: allowedOrigins.length ? allowedOrigins : true,
      credentials: true,
    },
  });

  ioInstance.use((socket, next) => {
    try {
      const cookies = parseCookies(socket.request.headers.cookie || '');
      const token = cookies.access_token;
      if (!token) return next(new Error('Not authorized'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = { id: decoded.id };
      next();
    } catch (err) {
      next(new Error('Not authorized'));
    }
  });

  ioInstance.on('connection', (socket) => {
    const rateState = {
      windowStart: Date.now(),
      count: 0,
    };

    socket.on('joinCommunity', async ({ communityId }) => {
      try {
        const community = await CommunityService.getCommunity(communityId, socket.user.id);
        socket.join(`community:${community._id}`);
      } catch (err) {
        socket.emit('errorMessage', { message: err.message || 'Unable to join community.' });
      }
    });

    socket.on('typing', ({ communityId, isTyping }) => {
      const roomName = `community:${communityId}`;
      if (!socket.rooms.has(roomName)) return;

      socket.to(roomName).emit('typing', {
        communityId,
        userId: socket.user.id,
        isTyping: Boolean(isTyping),
      });
    });

    socket.on('sendMessage', async ({ communityId, content }) => {
      try {
        const now = Date.now();
        if (now - rateState.windowStart > RATE_LIMIT_WINDOW_MS) {
          rateState.windowStart = now;
          rateState.count = 0;
        }
        rateState.count += 1;
        if (rateState.count > RATE_LIMIT_MAX) {
          socket.emit('errorMessage', { message: 'Slow down a bit.' });
          return;
        }

        const message = await CommunityService.createChatMessage(communityId, socket.user.id, content);
        const populated = await CommunityMessage.findById(message._id)
          .populate('userId', 'username fullName profilePicUrl');
        ioInstance.to(`community:${communityId}`).emit('chatMessage', populated);
      } catch (err) {
        socket.emit('errorMessage', { message: err.message || 'Message failed.' });
      }
    });
  });

  return ioInstance;
};

const getIo = () => ioInstance;

module.exports = { initSocket, getIo };
