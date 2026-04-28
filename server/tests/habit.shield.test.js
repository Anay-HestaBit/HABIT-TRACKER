const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { app } = require('../app');
const User = require('../models/User');
const Habit = require('../models/Habit');

const createToken = (userId) => jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
const authCookie = (userId) => `access_token=${createToken(userId)}; Path=/; HttpOnly`;

describe('Streak shield', () => {
  let mongoServer;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret';
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Habit.deleteMany({});
  });

  it('marks a habit completion as shielded', async () => {
    const user = await User.create({
      username: 'shielduser',
      fullName: 'Shield User',
      email: 'shield@example.com',
      password: 'password123',
    });

    const habitRes = await request(app)
      .post('/api/habits')
      .set('Cookie', authCookie(user._id))
      .send({ name: 'Meditate', frequency: 'daily' })
      .expect(201);

    const shieldRes = await request(app)
      .post(`/api/habits/${habitRes.body.habit._id}/shield`)
      .set('Cookie', authCookie(user._id))
      .expect(200);

    expect(shieldRes.body.habit.completions).toHaveLength(1);
    expect(shieldRes.body.habit.completions[0].shielded).toBe(true);
  });

  it('blocks using shield twice on the same day', async () => {
    const user = await User.create({
      username: 'shielduser2',
      fullName: 'Shield User Two',
      email: 'shield2@example.com',
      password: 'password123',
    });

    const habitRes = await request(app)
      .post('/api/habits')
      .set('Cookie', authCookie(user._id))
      .send({ name: 'Stretch', frequency: 'daily' })
      .expect(201);

    await request(app)
      .post(`/api/habits/${habitRes.body.habit._id}/shield`)
      .set('Cookie', authCookie(user._id))
      .expect(200);

    await request(app)
      .post(`/api/habits/${habitRes.body.habit._id}/shield`)
      .set('Cookie', authCookie(user._id))
      .expect(400);
  });
});
