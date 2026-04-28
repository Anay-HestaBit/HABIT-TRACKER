const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { app } = require('../app');
const User = require('../models/User');
const Community = require('../models/Community');
const CommunityHabit = require('../models/CommunityHabit');

const createToken = (userId) => jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
const authCookie = (userId) => `access_token=${createToken(userId)}; Path=/; HttpOnly`;

describe('Community leaderboard', () => {
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
    await Community.deleteMany({});
    await CommunityHabit.deleteMany({});
  });

  it('returns leaderboard with rangeDays', async () => {
    const owner = await User.create({
      username: 'owner5',
      fullName: 'Owner Five',
      email: 'owner5@example.com',
      password: 'password123',
    });

    const member = await User.create({
      username: 'member5',
      fullName: 'Member Five',
      email: 'member5@example.com',
      password: 'password123',
    });

    const createRes = await request(app)
      .post('/api/communities')
      .set('Cookie', authCookie(owner._id))
      .send({ name: 'Leaderboard Club', inviteCode: 'LEAD01' })
      .expect(201);

    await request(app)
      .post('/api/communities/join')
      .set('Cookie', authCookie(member._id))
      .send({ code: createRes.body.inviteCode })
      .expect(200);

    await request(app)
      .post(`/api/communities/${createRes.body._id}/approve`)
      .set('Cookie', authCookie(owner._id))
      .send({ userId: member._id.toString() })
      .expect(200);

    const habitRes = await request(app)
      .post(`/api/communities/${createRes.body._id}/habits`)
      .set('Cookie', authCookie(owner._id))
      .send({ name: 'Daily Focus', description: 'Stay focused', frequency: 'daily' })
      .expect(201);

    await request(app)
      .post(`/api/communities/${createRes.body._id}/habits/${habitRes.body.habit._id}/complete`)
      .set('Cookie', authCookie(member._id))
      .expect(200);

    const leaderboardRes = await request(app)
      .get(`/api/communities/${createRes.body._id}/leaderboard`)
      .set('Cookie', authCookie(member._id))
      .query({ days: 30 })
      .expect(200);

    expect(leaderboardRes.body.rangeDays).toBe(30);
    expect(leaderboardRes.body.leaderboard.length).toBeGreaterThan(0);
    expect(leaderboardRes.body.leaderboard[0].rangeCompletions).toBeGreaterThan(0);
  });
});
