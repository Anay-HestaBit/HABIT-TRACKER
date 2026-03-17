const UserRepository = require('../repositories/UserRepository');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const crypto = require('crypto');
const emailQueue = require('../queues/emailQueue');

class AuthService {
  async signup(userData) {
    const { username, email, password, fullName, age, gender } = userData;
    
    const existingUser = await UserRepository.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      throw new Error('User already exists');
    }

    const user = await UserRepository.create({ 
      username, 
      email, 
      password, 
      fullName, 
      age, 
      gender 
    });

    // Generate verification token
    const verificationToken = user.generateVerificationToken();
    await user.save();

    logger.info(`New user registered: ${username}. Verification token generated.`);
    
    // Queue verification email
    const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
    const emailHtml = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #0f172a; color: #ffffff; border-radius: 24px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="display: inline-block; padding: 12px; background: rgba(99, 102, 241, 0.2); border-radius: 16px; border: 1px solid rgba(99, 102, 241, 0.3);">
             <span style="font-size: 24px;">🌱</span>
          </div>
        </div>
        <h1 style="font-size: 28px; font-weight: 800; text-align: center; margin-bottom: 16px; background: linear-gradient(to right, #818cf8, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Welcome to HabitJourney!</h1>
        <p style="font-size: 16px; line-height: 1.6; text-align: center; color: #94a3b8; margin-bottom: 32px;">The best time to start was yesterday. The second best time is now. Let's verify your email to begin your journey.</p>
        <div style="text-align: center;">
          <a href="${verifyUrl}" style="display: inline-block; padding: 16px 32px; background: #6366f1; color: #ffffff; text-decoration: none; font-weight: 700; border-radius: 16px; box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3);">Verify My Email</a>
        </div>
        <p style="font-size: 14px; text-align: center; color: #475569; margin-top: 32px;">If the button doesn't work, copy this link: <br/> ${verifyUrl}</p>
      </div>
    `;

    await emailQueue.add('verification-email', {
      email: user.email,
      subject: '🌱 Verify your HabitJourney account',
      message: `Verify your account: ${verifyUrl}`,
      html: emailHtml
    });

    return { user, message: 'Registration successful. Please verify your email.' };
  }

  async verifyEmail(token) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await UserRepository.findOne({ 
      verificationToken: hashedToken,
      verificationTokenExpire: { $gt: Date.now() }
    });

    if (!user) {
      throw new Error('Invalid or expired verification token');
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;
    await user.save();

    return user;
  }

  async login(email, password) {
    const user = await UserRepository.findByEmail(email);
    if (!user || !(await user.comparePassword(password))) {
      throw new Error('Invalid credentials');
    }

    if (!user.isVerified) {
      throw new Error('Please verify your email first');
    }

    // Generate OTP for login
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otpCode = otp; // In a real app, hash this
    user.otpExpire = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save();

    logger.info(`OTP generated for user: ${user.username}`);

    const otpHtml = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #0f172a; color: #ffffff; border-radius: 24px;">
        <h1 style="font-size: 24px; font-weight: 800; text-align: center; margin-bottom: 24px;">Your Sign-in Code</h1>
        <div style="text-align: center; margin: 32px 0;">
          <div style="display: inline-block; padding: 24px 48px; background: rgba(99, 102, 241, 0.1); border: 2px dashed rgba(99, 102, 241, 0.5); border-radius: 20px;">
            <span style="font-size: 40px; font-weight: 900; letter-spacing: 8px; color: #818cf8;">${otp}</span>
          </div>
        </div>
        <p style="font-size: 14px; text-align: center; color: #94a3b8;">This code will expire in 10 minutes. Please do not share it with anyone.</p>
      </div>
    `;

    // Queue OTP email
    await emailQueue.add('otp-email', {
      email: user.email,
      subject: '🔑 Your HabitJourney Sign-in Code',
      message: `Your sign-in OTP is: ${otp}`,
      html: otpHtml
    });

    return { requiresOtp: true, email: user.email, otp: process.env.NODE_ENV !== 'production' ? otp : undefined };
  }

  async verifyOtp(email, otp) {
    const user = await UserRepository.findByEmail(email);
    if (!user || user.otpCode !== otp || user.otpExpire < Date.now()) {
      throw new Error('Invalid or expired OTP');
    }

    user.otpCode = undefined;
    user.otpExpire = undefined;
    await user.save();

    const token = this.generateToken(user._id);
    return { user, token };
  }

  async forgotPassword(email) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new Error('User not found with that email');
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 mins

    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    
    const resetHtml = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #0f172a; color: #ffffff; border-radius: 24px;">
        <h1 style="font-size: 24px; font-weight: 800; text-align: center; margin-bottom: 24px;">Password Reset</h1>
        <p style="font-size: 16px; line-height: 1.6; text-align: center; color: #94a3b8; margin-bottom: 32px;">Forgot your password? No worries. Click the button below to set a new one.</p>
        <div style="text-align: center;">
          <a href="${resetUrl}" style="display: inline-block; padding: 16px 32px; background: #ef4444; color: #ffffff; text-decoration: none; font-weight: 700; border-radius: 16px; box-shadow: 0 10px 15px -3px rgba(239, 68, 68, 0.3);">Reset My Password</a>
        </div>
        <p style="font-size: 14px; text-align: center; color: #475569; margin-top: 32px;">This link will expire in 10 minutes. If you didn't request this, ignore this email.</p>
      </div>
    `;

    // Queue reset password email
    await emailQueue.add('reset-password-email', {
      email: user.email,
      subject: '🔒 Reset your HabitJourney Password',
      message: `Reset your password here: ${resetUrl}`,
      html: resetHtml
    });

    return process.env.NODE_ENV !== 'production' ? resetToken : true;
  }

  async resetPassword(token, password) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await UserRepository.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return user;
  }

  async updateProfile(userId, updateData) {
    const allowedFields = ['fullName', 'age', 'gender', 'bio', 'profilePicUrl'];
    const filteredData = {};
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredData[key] = updateData[key];
      }
    });

    return UserRepository.update(userId, filteredData);
  }

  generateToken(id) {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });
  }

  async getUserById(id) {
    return UserRepository.findById(id);
  }
}

module.exports = new AuthService();
