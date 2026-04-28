const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { app } = require('../app');
const User = require('../models/User');
const Community = require('../models/Community');
const CommunityMessage = require('../models/CommunityMessage');

const createToken = (userId) => jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
const authCookie = (userId) => `access_token=${createToken(userId)}; Path=/; HttpOnly`;

describe('Community chat', () => {
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
    await CommunityMessage.deleteMany({});
  });

  it('sends, hides, and mutes chat messages', async () => {
    const owner = await User.create({
      username: 'owner7',
      fullName: 'Owner Seven',
      email: 'owner7@example.com',
      password: 'password123',
    });

    const member = await User.create({
      username: 'member7',
      fullName: 'Member Seven',
      email: 'member7@example.com',
      password: 'password123',
    });

    const communityRes = await request(app)
      .post('/api/communities')
      .set('Cookie', authCookie(owner._id))
      .send({ name: 'Chat Club', inviteCode: 'CHAT01' })
      .expect(201);

    await request(app)
      .post('/api/communities/join')
      .set('Cookie', authCookie(member._id))
      .send({ code: communityRes.body.inviteCode })
      .expect(200);

    await request(app)
      .post(`/api/communities/${communityRes.body._id}/approve`)
      .set('Cookie', authCookie(owner._id))
      .send({ userId: member._id.toString() })
      .expect(200);

    const messageRes = await request(app)
      .post(`/api/communities/${communityRes.body._id}/chat`)
      .set('Cookie', authCookie(member._id))
      .send({ content: 'Hello everyone!' })
      .expect(201);

    await request(app)
      .post(`/api/communities/${communityRes.body._id}/chat/${messageRes.body._id}/hide`)
      .set('Cookie', authCookie(owner._id))
      .expect(200);

    const memberView = await request(app)
      .get(`/api/communities/${communityRes.body._id}/chat`)
      .set('Cookie', authCookie(member._id))
      .expect(200);

    expect(memberView.body.messages).toHaveLength(0);

    await request(app)
      .post(`/api/communities/${communityRes.body._id}/chat/mute`)
      .set('Cookie', authCookie(owner._id))
      .send({ userId: member._id.toString(), minutes: 60 })
      .expect(200);

    await request(app)
      .post(`/api/communities/${communityRes.body._id}/chat`)
      .set('Cookie', authCookie(member._id))
      .send({ content: 'Muted message' })
      .expect(400);
  });
});
