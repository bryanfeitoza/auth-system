const request = require('supertest');
const express = require('express');
const { sequelize } = require('../src/config/database');

process.env.JWT_SECRET = 'test-secret-for-jwt';

const app = express();
app.use(express.json());
app.use('/api/auth', require('../src/routes/auth'));
app.use('/api/items', require('../src/routes/items'));

let accessToken;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Item User', email: 'items@test.com', password: '123456' });

  accessToken = res.body.access_token;
});

afterAll(async () => {
  await sequelize.close();
});

describe('CRUD /api/items', () => {
  let itemId;

  it('should create an item', async () => {
    const res = await request(app)
      .post('/api/items')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Test Item', description: 'A test item', status: 'pending' });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Test Item');
    itemId = res.body.id;
  });

  it('should list items with pagination', async () => {
    const res = await request(app)
      .get('/api/items?page=1&limit=10')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('totalPages');
  });

  it('should get a single item', async () => {
    const res = await request(app)
      .get(`/api/items/${itemId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(itemId);
  });

  it('should update an item', async () => {
    const res = await request(app)
      .put(`/api/items/${itemId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Updated Item', status: 'completed' });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated Item');
    expect(res.body.status).toBe('completed');
  });

  it('should delete an item', async () => {
    const res = await request(app)
      .delete(`/api/items/${itemId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
  });

  it('should return 404 for deleted item', async () => {
    const res = await request(app)
      .get(`/api/items/${itemId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(404);
  });
});
