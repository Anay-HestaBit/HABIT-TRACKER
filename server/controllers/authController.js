const AuthService = require('../services/AuthService');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');
const { uploadToCloudinary } = require('../utils/cloudinary');

class AuthController {
  async signup(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { user, message } = await AuthService.signup(req.body);
      res.status(201).json({ message, user: { id: user._id, email: user.email } });
    } catch (error) {
      logger.error('Signup error:', error);
      if (error.message === 'User already exists') {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  async verifyEmail(req, res, next) {
    try {
      const { token } = req.body;
      const user = await AuthService.verifyEmail(token);
      res.status(200).json({
        message: 'Email verified successfully. You can now log in.',
        user: { id: user._id, email: user.email },
      });
    } catch (error) {
      logger.error('Email verification error:', error);
      res.status(400).json({ message: error.message });
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      if (result.requiresOtp) {
        return res.status(200).json({
          status: 'otp_required',
          message: 'OTP sent to your email',
          email: result.email,
          otp: result.otp, // undefined in production
        });
      }
      this.sendToken(result.user, result.token, 200, res);
    } catch (error) {
      logger.error('Login error:', error);
      res.status(401).json({ message: error.message || 'Invalid credentials' });
    }
  }

  async verifyOtp(req, res, next) {
    try {
      const { email, otp } = req.body;
      const { user, token } = await AuthService.verifyOtp(email, otp);
      this.sendToken(user, token, 200, res);
    } catch (error) {
      logger.error('OTP verification error:', error);
      res.status(401).json({ message: error.message });
    }
  }

  async logout(req, res) {
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
      secure: isProduction,
      // FIX: 'none' required for cross-domain (Vercel + Render)
      sameSite: isProduction ? 'none' : 'lax',
      // Future-proof cross-site cookies (Chrome CHIPS warning)
      partitioned: isProduction,
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

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      await AuthService.forgotPassword(email);
      // Always return same message — prevents user enumeration
      res.status(200).json({ message: 'If that email is registered, a reset link has been sent.' });
    } catch (error) {
      logger.error('Forgot password error:', error);
      res.status(400).json({ message: error.message });
    }
  }

  async resetPassword(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { token, password } = req.body;
      await AuthService.resetPassword(token, password);
      res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
      logger.error('Reset password error:', error);
      res.status(400).json({ message: error.message });
    }
  }

  async updateProfile(req, res, next) {
    try {
      const user = await AuthService.updateProfile(req.user._id, req.body);
      res.status(200).json({ message: 'Profile updated successfully', user });
    } catch (error) {
      logger.error('Update profile error:', error);
      next(error);
    }
  }

  async uploadImage(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Please upload a file' });
      }
      // FIX: Pass buffer directly — memoryStorage gives us req.file.buffer
      const profilePicUrl = await uploadToCloudinary(req.file.buffer);
      const user = await AuthService.updateProfile(req.user._id, { profilePicUrl });
      res.status(200).json({ message: 'Image uploaded successfully', profilePicUrl, user });
    } catch (error) {
      logger.error('Image upload error:', error);
      next(error);
    }
  }

  sendToken(user, token, statusCode, res) {
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      httpOnly: true,
      // FIX: Cross-domain cookies (Vercel ↔ Render) require sameSite:'none' + secure:true
      // Without this, the browser silently drops the cookie and auth breaks in production
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      // Future-proof cross-site cookies (Chrome CHIPS warning)
      partitioned: isProduction,
    };
    res.cookie('token', token, cookieOptions);
    user.password = undefined;
    res.status(statusCode).json({ user });
  }
}

module.exports = new AuthController();
