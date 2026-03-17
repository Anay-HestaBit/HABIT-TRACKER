const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const rateLimit = require('express-rate-limit');

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 20, 
  message: { message: 'Too many auth attempts, please try again later' }
});

// @route   POST /api/auth/signup
router.post('/signup', authLimiter, [
  body('username').notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/).withMessage('Password must contain uppercase, lowercase, number and special character'),
], authController.signup.bind(authController));

// @route   POST /api/auth/verify-email
router.post('/verify-email', authController.verifyEmail.bind(authController));

// @route   POST /api/auth/login
router.post('/login', authLimiter, authController.login.bind(authController));

// @route   POST /api/auth/verify-otp
router.post('/verify-otp', authController.verifyOtp.bind(authController));

// @route   POST /api/auth/logout
router.post('/logout', authController.logout.bind(authController));

// @route   POST /api/auth/forgot-password
router.post('/forgot-password', authController.forgotPassword.bind(authController));

// @route   POST /api/auth/reset-password
router.post('/reset-password', authController.resetPassword.bind(authController));

// @route   PUT /api/auth/profile
router.put('/profile', protect, authController.updateProfile.bind(authController));

// @route   POST /api/auth/upload-image
router.post('/upload-image', protect, upload.single('image'), authController.uploadImage.bind(authController));

// @route   GET /api/auth/me
router.get('/me', protect, authController.getMe.bind(authController));

module.exports = router;
