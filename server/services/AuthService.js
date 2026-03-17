const UserRepository = require('../repositories/UserRepository');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

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
    logger.info(`New user registered: ${username} (${email})`);
    
    const token = this.generateToken(user._id);
    return { user, token };
  }

  async login(email, password) {
    const user = await UserRepository.findByEmail(email);
    if (!user || !(await user.comparePassword(password))) {
      throw new Error('Invalid credentials');
    }

    logger.info(`User logged in: ${user.username}`);
    const token = this.generateToken(user._id);
    return { user, token };
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
