const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { app } = require('../app');
const User = require('../models/User');

const Community = require('../models/Community');

const createToken = (userId) => jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

const authCookie = (userId) => `access_token=${createToken(userId)}; Path=/; HttpOnly`;

describe('Community approvals', () => {
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
  });

  it('returns approvals for owners/admins with pending requests', async () => {
    const owner = await User.create({
      username: 'owner',
      fullName: 'Owner One',
      email: 'owner@example.com',
      password: 'password123',
    });

    const requester = await User.create({
      username: 'requester',
      fullName: 'Requester One',
      email: 'requester@example.com',
      password: 'password123',
    });

    const createRes = await request(app)
      .post('/api/communities')
      .set('Cookie', authCookie(owner._id))
      .send({ name: 'Focus Crew', inviteCode: 'FOCUS1' })
      .expect(201);

    await request(app)
      .post('/api/communities/join')
      .set('Cookie', authCookie(requester._id))
      .send({ code: createRes.body.inviteCode })
      .expect(200);

    const listRes = await request(app)
      .get('/api/communities')
      .set('Cookie', authCookie(owner._id))
      .expect(200);

    expect(listRes.body.approvals).toHaveLength(1);
    expect(listRes.body.approvals[0].pendingRequests).toHaveLength(1);
    expect(listRes.body.approvals[0].pendingRequests[0].userId.username).toBe('requester');
  });

  it('approves a pending request and removes it from approvals', async () => {
    const owner = await User.create({
      username: 'owner2',
      fullName: 'Owner Two',
      email: 'owner2@example.com',
      password: 'password123',
    });

    const requester = await User.create({
      username: 'requester2',
      fullName: 'Requester Two',
      email: 'requester2@example.com',
      password: 'password123',
    });

    const createRes = await request(app)
      .post('/api/communities')
      .set('Cookie', authCookie(owner._id))
      .send({ name: 'Morning Club', inviteCode: 'MORN1' })
      .expect(201);

    await request(app)
      .post('/api/communities/join')
      .set('Cookie', authCookie(requester._id))
      .send({ code: createRes.body.inviteCode })
      .expect(200);

    await request(app)
      .post(`/api/communities/${createRes.body._id}/approve`)
      .set('Cookie', authCookie(owner._id))
      .send({ userId: requester._id.toString() })
      .expect(200);

    const listRes = await request(app)
      .get('/api/communities')
      .set('Cookie', authCookie(owner._id))
      .expect(200);

    expect(listRes.body.approvals || []).toHaveLength(0);
  });

  it('rejects a pending request', async () => {
    const owner = await User.create({
      username: 'owner3',
      fullName: 'Owner Three',
      email: 'owner3@example.com',
      password: 'password123',
    });

    const requester = await User.create({
      username: 'requester3',
      fullName: 'Requester Three',
      email: 'requester3@example.com',
      password: 'password123',
    });

    const createRes = await request(app)
      .post('/api/communities')
      .set('Cookie', authCookie(owner._id))
      .send({ name: 'Reject Club', inviteCode: 'REJ001' })
      .expect(201);

    await request(app)
      .post('/api/communities/join')
      .set('Cookie', authCookie(requester._id))
      .send({ code: createRes.body.inviteCode })
      .expect(200);

    await request(app)
      .post(`/api/communities/${createRes.body._id}/reject`)
      .set('Cookie', authCookie(owner._id))
      .send({ userId: requester._id.toString() })
      .expect(200);

    const listRes = await request(app)
      .get('/api/communities')
      .set('Cookie', authCookie(owner._id))
      .expect(200);

    expect(listRes.body.approvals || []).toHaveLength(0);
  });

  it('removes a member from the community', async () => {
    const owner = await User.create({
      username: 'owner4',
      fullName: 'Owner Four',
      email: 'owner4@example.com',
      password: 'password123',
    });

    const member = await User.create({
      username: 'member4',
      fullName: 'Member Four',
      email: 'member4@example.com',
      password: 'password123',
    });

    const createRes = await request(app)
      .post('/api/communities')
      .set('Cookie', authCookie(owner._id))
      .send({ name: 'Remove Club', inviteCode: 'REM001' })
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

    const removeRes = await request(app)
      .post(`/api/communities/${createRes.body._id}/remove`)
      .set('Cookie', authCookie(owner._id))
      .send({ userId: member._id.toString() })
      .expect(200);

    expect(removeRes.body.community.members).toHaveLength(1);
  });
});
