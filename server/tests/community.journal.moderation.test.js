const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { app } = require('../app');
const User = require('../models/User');
const Community = require('../models/Community');
const CommunityReflection = require('../models/CommunityReflection');

const createToken = (userId) => jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
const authCookie = (userId) => `access_token=${createToken(userId)}; Path=/; HttpOnly`;

describe('Community journal moderation', () => {
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
    await CommunityReflection.deleteMany({});
  });

  it('pins and hides journal entries for admins', async () => {
    const owner = await User.create({
      username: 'owner6',
      fullName: 'Owner Six',
      email: 'owner6@example.com',
      password: 'password123',
    });

    const member = await User.create({
      username: 'member6',
      fullName: 'Member Six',
      email: 'member6@example.com',
      password: 'password123',
    });

    const createRes = await request(app)
      .post('/api/communities')
      .set('Cookie', authCookie(owner._id))
      .send({ name: 'Journal Club', inviteCode: 'JRNL01' })
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

    const entryRes = await request(app)
      .post(`/api/communities/${createRes.body._id}/journal`)
      .set('Cookie', authCookie(member._id))
      .send({ content: 'Shared update', mood: 'good' })
      .expect(201);

    await request(app)
      .post(`/api/communities/${createRes.body._id}/journal/${entryRes.body._id}/pin`)
      .set('Cookie', authCookie(owner._id))
      .expect(200);

    const memberView = await request(app)
      .get(`/api/communities/${createRes.body._id}/journal`)
      .set('Cookie', authCookie(member._id))
      .expect(200);

    expect(memberView.body.entries[0].isPinned).toBe(true);

    await request(app)
      .post(`/api/communities/${createRes.body._id}/journal/${entryRes.body._id}/hide`)
      .set('Cookie', authCookie(owner._id))
      .expect(200);

    const memberHidden = await request(app)
      .get(`/api/communities/${createRes.body._id}/journal`)
      .set('Cookie', authCookie(member._id))
      .expect(200);

    expect(memberHidden.body.entries).toHaveLength(0);

    const ownerHidden = await request(app)
      .get(`/api/communities/${createRes.body._id}/journal`)
      .set('Cookie', authCookie(owner._id))
      .expect(200);

    expect(ownerHidden.body.entries[0].isHidden).toBe(true);
  });
});
