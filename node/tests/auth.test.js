const request = require('supertest');
const express = require('express');
const { sequelize } = require('../src/config/database');

process.env.JWT_SECRET = 'test-secret-for-jwt';

const app = express();
app.use(express.json());
app.use('/api/auth', require('../src/routes/auth'));

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('POST /api/auth/register', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'test@test.com', password: '123456' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('access_token');
    expect(res.body).toHaveProperty('refresh_token');
    expect(res.body.user.email).toBe('test@test.com');
  });

  it('should reject duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'test@test.com', password: '123456' });

    expect(res.status).toBe(409);
  });

  it('should reject weak password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'weak@test.com', password: '123' });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('should login with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: '123456' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('access_token');
    expect(res.body).toHaveProperty('refresh_token');
  });

  it('should reject invalid password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'wrong' });

    expect(res.status).toBe(401);
  });

  it('should reject non-existent user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'noone@test.com', password: '123456' });

    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/refresh', () => {
  it('should refresh tokens', async () => {
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: '123456' });

    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refresh_token: login.body.refresh_token });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('access_token');
    expect(res.body).toHaveProperty('refresh_token');
  });

  it('should reject invalid refresh token', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refresh_token: 'invalid-token' });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  it('should return user profile', async () => {
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: '123456' });

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${login.body.access_token}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe('test@test.com');
  });

  it('should reject without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
