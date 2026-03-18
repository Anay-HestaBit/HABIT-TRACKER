const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Check for token in cookies (preferred for security)
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } 
  // Fallback to Authorization header
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }
    if (req.user.isDeleted) {
      return res.status(403).json({ message: 'Account is deactivated' });
    }
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

module.exports = { protect };
