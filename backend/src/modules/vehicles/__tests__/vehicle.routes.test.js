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
  app.use('/api/v1/vehicles', vehicleRoutes);
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

describe('GET /api/v1/vehicles/stats', () => {
  let app;
  beforeAll(() => { app = createApp(); });
  beforeEach(() => { mockDb.__resetMocks(); });

  it('returns stats for authenticated user', async () => {
    setDbResult([mockVehicle], null, 1);

    const res = await request(app)
      .get('/api/v1/vehicles/stats')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('total');
    expect(res.body.data).toHaveProperty('totalValue');
    expect(res.body.data).toHaveProperty('lowStock');
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/v1/vehicles/stats');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/v1/vehicles/:id/purchase', () => {
  let app;
  beforeAll(() => { app = createApp(); });
  beforeEach(() => { mockDb.__resetMocks(); });

  it('purchases a vehicle and decrements quantity', async () => {
    setDbResult(mockVehicle);

    const res = await request(app)
      .post('/api/v1/vehicles/vehicle-1/purchase')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Vehicle purchased');
  });

  it('returns 400 when out of stock', async () => {
    setDbResult({ ...mockVehicle, quantity: 0 });

    const res = await request(app)
      .post('/api/v1/vehicles/vehicle-1/purchase')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('OUT_OF_STOCK');
  });

  it('returns 401 without token', async () => {
    const res = await request(app).post('/api/v1/vehicles/vehicle-1/purchase');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/v1/vehicles/:id/restock', () => {
  let app;
  beforeAll(() => { app = createApp(); });
  beforeEach(() => { mockDb.__resetMocks(); });

  it('restocks a vehicle as admin', async () => {
    setDbResult(mockVehicle);

    const res = await request(app)
      .post('/api/v1/vehicles/vehicle-1/restock')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quantity: 10 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Vehicle restocked');
  });

  it('returns 403 for non-admin user', async () => {
    const res = await request(app)
      .post('/api/v1/vehicles/vehicle-1/restock')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ quantity: 10 });

    expect(res.status).toBe(403);
  });

  it('returns 422 for invalid quantity', async () => {
    const res = await request(app)
      .post('/api/v1/vehicles/vehicle-1/restock')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quantity: 0 });

    expect(res.status).toBe(422);
  });

  it('returns 401 without token', async () => {
    const res = await request(app)
      .post('/api/v1/vehicles/vehicle-1/restock')
      .send({ quantity: 5 });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/v1/vehicles', () => {
  let app;
  beforeAll(() => { app = createApp(); });
  beforeEach(() => { mockDb.__resetMocks(); });

  it('lists vehicles with pagination', async () => {
    setDbResult([mockVehicle], null, 1);

    const res = await request(app)
      .get('/api/v1/vehicles')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.meta).toHaveProperty('totalItems');
  });

  it('supports search query', async () => {
    setDbResult([mockVehicle], null, 1);

    const res = await request(app)
      .get('/api/v1/vehicles?q=Toyota')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
  });
});

describe('GET /api/v1/vehicles/search', () => {
  let app;
  beforeAll(() => { app = createApp(); });
  beforeEach(() => { mockDb.__resetMocks(); });

  it('search alias works', async () => {
    setDbResult([mockVehicle], null, 1);

    const res = await request(app)
      .get('/api/v1/vehicles/search?q=Camry')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
  });
});

describe('GET /api/v1/vehicles/:id', () => {
  let app;
  beforeAll(() => { app = createApp(); });
  beforeEach(() => { mockDb.__resetMocks(); });

  it('returns vehicle by id', async () => {
    setDbResult(mockVehicle);

    const res = await request(app)
      .get('/api/v1/vehicles/vehicle-1')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('vehicle-1');
  });

  it('returns 404 when not found', async () => {
    setDbResult(null);

    const res = await request(app)
      .get('/api/v1/vehicles/missing')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(404);
    expect(res.body.code).toBe('VEHICLE_NOT_FOUND');
  });
});

describe('POST /api/v1/vehicles (admin)', () => {
  let app;
  beforeAll(() => { app = createApp(); });
  beforeEach(() => { mockDb.__resetMocks(); });

  it('creates vehicle as admin', async () => {
    setDbResult(mockVehicle);

    const res = await request(app)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ make: 'Toyota', model: 'Camry', category: 'sedan', price: 25000 });

    expect(res.status).toBe(201);
  });

  it('returns 403 for non-admin', async () => {
    const res = await request(app)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ make: 'Toyota', model: 'Camry', category: 'sedan', price: 25000 });

    expect(res.status).toBe(403);
  });

  it('returns 422 for invalid payload', async () => {
    const res = await request(app)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ make: '' });

    expect(res.status).toBe(422);
  });
});

describe('PUT /api/v1/vehicles/:id (admin)', () => {
  let app;
  beforeAll(() => { app = createApp(); });
  beforeEach(() => { mockDb.__resetMocks(); });

  it('updates vehicle as admin', async () => {
    setDbResult(mockVehicle);

    const res = await request(app)
      .put('/api/v1/vehicles/vehicle-1')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: 30000 });

    expect(res.status).toBe(200);
  });
});

describe('DELETE /api/v1/vehicles/:id (admin)', () => {
  let app;
  beforeAll(() => { app = createApp(); });
  beforeEach(() => { mockDb.__resetMocks(); });

  it('deletes vehicle as admin', async () => {
    setDbResult(mockVehicle);

    const res = await request(app)
      .delete('/api/v1/vehicles/vehicle-1')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(204);
  });

  it('returns 403 for non-admin', async () => {
    const res = await request(app)
      .delete('/api/v1/vehicles/vehicle-1')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });
});
