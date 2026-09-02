const request = require('supertest');
const app = require('../server/src/app');

describe('Auth API', () => {
  it('should return 400 when registering without required fields', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 when login without credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
