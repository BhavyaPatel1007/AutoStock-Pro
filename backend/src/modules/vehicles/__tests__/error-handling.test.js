process.env.NODE_ENV = 'test';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SECRET_KEY = 'test-secret-key';
process.env.SUPABASE_SERVICE_KEY = 'test-secret-key';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-long-enough-for-jwt';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-long-enough-for-jwt';
process.env.JWT_ACCESS_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';

const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

let mockResult = { data: null, error: null, count: null };

const buildChain = () => ({
  from: undefined,
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  neq: jest.fn().mockReturnThis(),
  gte: jest.fn().mockReturnThis(),
  lte: jest.fn().mockReturnThis(),
  ilike: jest.fn().mockReturnThis(),
  single: jest.fn().mockImplementation(() =>
    Promise.resolve({ data: mockResult.data, error: mockResult.error })
  ),
  maybeSingle: jest.fn().mockImplementation(() =>
    Promise.resolve({ data: mockResult.data, error: mockResult.error })
  ),
  order: jest.fn().mockReturnThis(),
  range: jest.fn().mockReturnThis(),
  or: jest.fn().mockReturnThis(),
  then: (resolve) => resolve(mockResult),
});

jest.mock('../../../config/database', () => {
  const supabase = { from: jest.fn(() => buildChain()) };
  supabase.__setMockResult = (r) => { mockResult = r; };
  supabase.__resetMocks = () => {
    mockResult = { data: null, error: null, count: null };
  };
  return supabase;
});

const mockDb = require('../../../config/database');

const errorHandler = require('../../../middleware/errorHandler');
const vehicleRoutes = require('../vehicle.routes');

const createApp = () => {
  const app = express();
  app.use(express.json());

  const router = require('express').Router();
  router.use('/api/v1/vehicles', vehicleRoutes);

  app.use(router);

  app.all('*', (req, _res, next) => {
    const AppError = require('../../../shared/errors/AppError');
    const { HTTP_STATUS } = require('../../../shared/constants/statusCodes');
    next(new AppError(`Route ${req.originalUrl} not found`, HTTP_STATUS.NOT_FOUND, 'ROUTE_NOT_FOUND'));
  });

  app.use(errorHandler);
  return app;
};

const adminToken = jwt.sign(
  { sub: 'admin-id', email: 'admin@test.com', role: 'admin' },
  process.env.JWT_ACCESS_SECRET,
  { expiresIn: '15m' }
);

const userToken = jwt.sign(
  { sub: 'user-id', email: 'user@test.com', role: 'user' },
  process.env.JWT_ACCESS_SECRET,
  { expiresIn: '15m' }
);

const invalidToken = jwt.sign(
  { sub: 'user-id', email: 'user@test.com', role: 'user' },
  'wrong-secret',
  { expiresIn: '15m' }
);

const expiredToken = jwt.sign(
  { sub: 'user-id', email: 'user@test.com', role: 'user' },
  process.env.JWT_ACCESS_SECRET,
  { expiresIn: '0s' }
);

const mockVehicle = {
  id: 'vehicle-1',
  make: 'Toyota',
  model: 'Camry',
  category: 'sedan',
  price: 25000,
  quantity: 5,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const setDbResult = (data, error = null, count = null) => {
  mockDb.__setMockResult({ data, error, count });
};

describe('Invalid Routes', () => {
  let app;
  beforeAll(() => { app = createApp(); });

  it('returns 404 for nonexistent route', async () => {
    const res = await request(app)
      .get('/api/v1/nonexistent')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('ROUTE_NOT_FOUND');
  });

  it('returns 404 for nonexistent nested route', async () => {
    const res = await request(app)
      .get('/api/v1/vehicles/wrong/route')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });

  it('returns 404 for POST to nonexistent route', async () => {
    const res = await request(app)
      .post('/api/v1/unknown/endpoint')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });
});

describe('Authentication Errors', () => {
  let app;
  beforeAll(() => { app = createApp(); });

  it('returns 401 when no Authorization header is sent', async () => {
    const res = await request(app).get('/api/v1/vehicles');

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('NO_TOKEN');
  });

  it('returns 401 when Authorization header is missing Bearer prefix', async () => {
    const res = await request(app)
      .get('/api/v1/vehicles')
      .set('Authorization', userToken);

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('NO_TOKEN');
  });

  it('returns 401 when Authorization header has no Bearer prefix', async () => {
    const res = await request(app)
      .get('/api/v1/vehicles')
      .set('Authorization', 'NotBearer token123');

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('NO_TOKEN');
  });

  it('returns 401 for malformed JWT', async () => {
    const res = await request(app)
      .get('/api/v1/vehicles')
      .set('Authorization', 'Bearer not-a-valid-jwt');

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('INVALID_TOKEN');
  });

  it('returns 401 for JWT signed with wrong secret', async () => {
    const res = await request(app)
      .get('/api/v1/vehicles')
      .set('Authorization', `Bearer ${invalidToken}`);

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('INVALID_TOKEN');
  });

  it('returns 401 for expired JWT', async () => {
    const res = await request(app)
      .get('/api/v1/vehicles')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('TOKEN_EXPIRED');
  });
});

describe('Database Errors', () => {
  let app;
  beforeAll(() => { app = createApp(); });
  beforeEach(() => { mockDb.__resetMocks(); });

  it('returns 500 when database throws on list', async () => {
    setDbResult(null, new Error('DB connection failed'));

    const res = await request(app)
      .get('/api/v1/vehicles')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('returns 500 when database throws on get by id', async () => {
    setDbResult(null, new Error('DB connection failed'));

    const res = await request(app)
      .get('/api/v1/vehicles/vehicle-1')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(500);
  });

  it('returns 500 when database throws on create', async () => {
    setDbResult(null, new Error('DB connection failed'));

    const res = await request(app)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ make: 'Test', model: 'Test', category: 'sedan', price: 100 });

    expect(res.status).toBe(500);
  });

  it('returns 500 when database throws on update', async () => {
    setDbResult(null, new Error('DB connection failed'));

    const res = await request(app)
      .put('/api/v1/vehicles/vehicle-1')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: 100 });

    expect(res.status).toBe(500);
  });

  it('returns 500 when database throws on delete', async () => {
    setDbResult(null, new Error('DB connection failed'));

    const res = await request(app)
      .delete('/api/v1/vehicles/vehicle-1')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(500);
  });

  it('returns 500 when database throws on purchase', async () => {
    setDbResult(null, new Error('DB connection failed'));

    const res = await request(app)
      .post('/api/v1/vehicles/vehicle-1/purchase')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(500);
  });

  it('returns 500 when database throws on restock', async () => {
    setDbResult(null, new Error('DB connection failed'));

    const res = await request(app)
      .post('/api/v1/vehicles/vehicle-1/restock')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quantity: 5 });

    expect(res.status).toBe(500);
  });

  it('handles Supabase PGRST104 error (not found)', async () => {
    setDbResult(null, { code: 'PGRST104', message: 'Resource not found' });

    const res = await request(app)
      .get('/api/v1/vehicles/vehicle-1')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
    expect(res.body.code).toBe('NOT_FOUND');
  });

  it('handles Supabase unique constraint violation (23505)', async () => {
    const error = { code: '23505', message: 'duplicate key value violates unique constraint' };
    setDbResult(null, error);

    const res = await request(app)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ make: 'Test', model: 'Test', category: 'sedan', price: 100 });

    expect(res.status).toBe(409);
    expect(res.body.code).toBe('DUPLICATE');
  });

  it('handles Supabase foreign key violation (23503)', async () => {
    const error = { code: '23503', message: 'insert or update on table violates foreign key constraint' };
    setDbResult(null, error);

    const res = await request(app)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ make: 'Test', model: 'Test', category: 'sedan', price: 100 });

    expect(res.status).toBe(404);
    expect(res.body.code).toBe('FK_ERROR');
  });

  it('handles Supabase PGRST205 error (missing table)', async () => {
    const error = { code: 'PGRST205', message: 'Database table not found' };
    setDbResult(null, error);

    const res = await request(app)
      .get('/api/v1/vehicles')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(500);
    expect(res.body.code).toBe('DB_MISSING_TABLE');
  });
});

describe('Authorization Errors', () => {
  let app;
  beforeAll(() => { app = createApp(); });

  it('returns 403 when normal user tries to create a vehicle', async () => {
    const res = await request(app)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ make: 'Test', model: 'Test', category: 'sedan', price: 100 });

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');
  });

  it('returns 403 when normal user tries to update a vehicle', async () => {
    const res = await request(app)
      .put('/api/v1/vehicles/vehicle-1')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ price: 200 });

    expect(res.status).toBe(403);
  });

  it('returns 403 when normal user tries to delete a vehicle', async () => {
    const res = await request(app)
      .delete('/api/v1/vehicles/vehicle-1')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });

  it('returns 403 when normal user tries to restock', async () => {
    const res = await request(app)
      .post('/api/v1/vehicles/vehicle-1/restock')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ quantity: 5 });

    expect(res.status).toBe(403);
  });
});
