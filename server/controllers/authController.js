const AuthService = require('../services/AuthService');
const logger = require('../utils/logger');

class AuthController {
  async signup(req, res, next) {
    try {
      const { user, token } = await AuthService.signup(req.body);
      this.sendToken(user, token, 201, res);
    } catch (error) {
      logger.error('Signup error:', error);
      if (error.message === 'User already exists') {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const { user, token } = await AuthService.login(email, password);
      this.sendToken(user, token, 200, res);
    } catch (error) {
      logger.error('Login error:', error);
      res.status(401).json({ message: 'Invalid credentials' });
    }
  }

  async logout(req, res) {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });
    res.status(200).json({ status: 'success' });
  }

  async getMe(req, res, next) {
    try {
      const user = await AuthService.getUserById(req.user._id);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  sendToken(user, token, statusCode, res) {
    const cookieOptions = {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    };

    res.cookie('token', token, cookieOptions);
    user.password = undefined;
    res.status(statusCode).json({ user, token });
  }
}

module.exports = new AuthController();
