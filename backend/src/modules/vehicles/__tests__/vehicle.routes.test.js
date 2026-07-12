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

const mockVehicles = [
  mockVehicle,
  { ...mockVehicle, id: 'vehicle-2', make: 'Honda', model: 'CR-V', category: 'suv', price: 31300, quantity: 10 },
  { ...mockVehicle, id: 'vehicle-3', make: 'Ford', model: 'F-150', category: 'truck', price: 35670, quantity: 0 },
];

const setDbResult = (data, error = null, count = null) => {
  mockDb.__setMockResult({ data, error, count });
};

describe('GET /api/v1/vehicles/stats', () => {
  let app;
  beforeAll(() => { app = createApp(); });
  beforeEach(() => { mockDb.__resetMocks(); });

  it('returns stats for authenticated user', async () => {
    setDbResult(mockVehicles, null, 3);

    const res = await request(app)
      .get('/api/v1/vehicles/stats')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('total');
    expect(res.body.data).toHaveProperty('totalValue');
    expect(res.body.data).toHaveProperty('lowStock');
    expect(res.body.data).toHaveProperty('outOfStock');
    expect(res.body.data).toHaveProperty('avgPrice');
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/v1/vehicles/stats');
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('NO_TOKEN');
  });
});

describe('GET /api/v1/vehicles', () => {
  let app;
  beforeAll(() => { app = createApp(); });
  beforeEach(() => { mockDb.__resetMocks(); });

  it('lists vehicles with pagination', async () => {
    setDbResult(mockVehicles, null, 3);

    const res = await request(app)
      .get('/api/v1/vehicles')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(3);
    expect(res.body.meta).toHaveProperty('totalItems');
    expect(res.body.meta.totalItems).toBe(3);
  });

  it('supports search by q parameter', async () => {
    setDbResult([mockVehicle], null, 1);

    const res = await request(app)
      .get('/api/v1/vehicles?q=Toyota')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('supports search by search parameter', async () => {
    setDbResult([mockVehicle], null, 1);

    const res = await request(app)
      .get('/api/v1/vehicles?search=Camry')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('filters by make', async () => {
    setDbResult([mockVehicle], null, 1);

    const res = await request(app)
      .get('/api/v1/vehicles?make=Toyota')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
  });

  it('filters by model', async () => {
    setDbResult([mockVehicle], null, 1);

    const res = await request(app)
      .get('/api/v1/vehicles?model=Camry')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
  });

  it('filters by category', async () => {
    setDbResult([mockVehicle], null, 1);

    const res = await request(app)
      .get('/api/v1/vehicles?category=sedan')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
  });

  it('filters by price range', async () => {
    setDbResult([mockVehicle], null, 1);

    const res = await request(app)
      .get('/api/v1/vehicles?minPrice=20000&maxPrice=30000')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
  });

  it('accepts sortBy and sortOrder parameters', async () => {
    setDbResult(mockVehicles, null, 3);

    const res = await request(app)
      .get('/api/v1/vehicles?sortBy=price&sortOrder=asc')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/v1/vehicles');
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('NO_TOKEN');
  });

  it('returns empty array when no vehicles match', async () => {
    setDbResult([], null, 0);

    const res = await request(app)
      .get('/api/v1/vehicles?q=Nonexistent')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.meta.totalItems).toBe(0);
  });

  it('accepts pagination parameters', async () => {
    setDbResult(mockVehicles, null, 3);

    const res = await request(app)
      .get('/api/v1/vehicles?page=1&limit=2')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
  });

  it('returns 422 for invalid sortBy', async () => {
    const res = await request(app)
      .get('/api/v1/vehicles?sortBy=invalid')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(422);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('returns 422 for invalid sortOrder', async () => {
    const res = await request(app)
      .get('/api/v1/vehicles?sortOrder=invalid')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(422);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });
});

describe('GET /api/v1/vehicles/search', () => {
  let app;
  beforeAll(() => { app = createApp(); });
  beforeEach(() => { mockDb.__resetMocks(); });

  it('search alias returns vehicles', async () => {
    setDbResult([mockVehicle], null, 1);

    const res = await request(app)
      .get('/api/v1/vehicles/search?q=Camry')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/v1/vehicles/search?q=Camry');
    expect(res.status).toBe(401);
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
    expect(res.body.data.make).toBe('Toyota');
    expect(res.body.data.model).toBe('Camry');
    expect(res.body.data.category).toBe('sedan');
  });

  it('returns 404 when vehicle not found', async () => {
    setDbResult(null);

    const res = await request(app)
      .get('/api/v1/vehicles/nonexistent-id')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(404);
    expect(res.body.code).toBe('VEHICLE_NOT_FOUND');
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/v1/vehicles/vehicle-1');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/v1/vehicles (admin)', () => {
  let app;
  beforeAll(() => { app = createApp(); });
  beforeEach(() => { mockDb.__resetMocks(); });

  const validPayload = { make: 'Toyota', model: 'Camry', category: 'sedan', price: 25000, quantity: 5 };

  it('creates vehicle as admin', async () => {
    setDbResult(mockVehicle);

    const res = await request(app)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(validPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
  });

  it('returns 403 for non-admin user', async () => {
    const res = await request(app)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${userToken}`)
      .send(validPayload);

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');
  });

  it('returns 422 for missing required fields', async () => {
    const res = await request(app)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});

    expect(res.status).toBe(422);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('returns 422 for missing make', async () => {
    const res = await request(app)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ model: 'Camry', category: 'sedan', price: 25000 });

    expect(res.status).toBe(422);
  });

  it('returns 422 for missing model', async () => {
    const res = await request(app)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ make: 'Toyota', category: 'sedan', price: 25000 });

    expect(res.status).toBe(422);
  });

  it('returns 422 for missing category', async () => {
    const res = await request(app)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ make: 'Toyota', model: 'Camry', price: 25000 });

    expect(res.status).toBe(422);
  });

  it('returns 422 for missing price', async () => {
    const res = await request(app)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ make: 'Toyota', model: 'Camry', category: 'sedan' });

    expect(res.status).toBe(422);
  });

  it('returns 422 for invalid price (negative)', async () => {
    const res = await request(app)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...validPayload, price: -100 });

    expect(res.status).toBe(422);
  });

  it('returns 422 for invalid quantity (negative)', async () => {
    const res = await request(app)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...validPayload, quantity: -5 });

    expect(res.status).toBe(422);
  });

  it('returns 422 for invalid category', async () => {
    const res = await request(app)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...validPayload, category: 'invalid-category' });

    expect(res.status).toBe(422);
  });

  it('returns 401 without token', async () => {
    const res = await request(app)
      .post('/api/v1/vehicles')
      .send(validPayload);

    expect(res.status).toBe(401);
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
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Vehicle updated');
  });

  it('returns 403 for non-admin user', async () => {
    const res = await request(app)
      .put('/api/v1/vehicles/vehicle-1')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ price: 30000 });

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');
  });

  it('returns 404 for non-existent vehicle', async () => {
    setDbResult(null);

    const res = await request(app)
      .put('/api/v1/vehicles/nonexistent-id')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: 30000 });

    expect(res.status).toBe(404);
    expect(res.body.code).toBe('VEHICLE_NOT_FOUND');
  });

  it('returns 422 for invalid payload', async () => {
    const res = await request(app)
      .put('/api/v1/vehicles/vehicle-1')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ category: 'invalid' });

    expect(res.status).toBe(422);
  });

  it('returns 422 for negative price', async () => {
    const res = await request(app)
      .put('/api/v1/vehicles/vehicle-1')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: -1 });

    expect(res.status).toBe(422);
  });

  it('returns 422 for empty body', async () => {
    const res = await request(app)
      .put('/api/v1/vehicles/vehicle-1')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});

    expect(res.status).toBe(422);
  });

  it('returns 401 without token', async () => {
    const res = await request(app)
      .put('/api/v1/vehicles/vehicle-1')
      .send({ price: 30000 });

    expect(res.status).toBe(401);
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

  it('returns 403 for non-admin user', async () => {
    const res = await request(app)
      .delete('/api/v1/vehicles/vehicle-1')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');
  });

  it('returns 404 for non-existent vehicle', async () => {
    setDbResult(null);

    const res = await request(app)
      .delete('/api/v1/vehicles/nonexistent-id')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
    expect(res.body.code).toBe('VEHICLE_NOT_FOUND');
  });

  it('returns 401 without token', async () => {
    const res = await request(app).delete('/api/v1/vehicles/vehicle-1');
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

  it('returns 400 when vehicle is out of stock', async () => {
    setDbResult({ ...mockVehicle, quantity: 0 });

    const res = await request(app)
      .post('/api/v1/vehicles/vehicle-1/purchase')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('OUT_OF_STOCK');
  });

  it('returns 404 for non-existent vehicle', async () => {
    setDbResult(null);

    const res = await request(app)
      .post('/api/v1/vehicles/nonexistent-id/purchase')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(404);
    expect(res.body.code).toBe('VEHICLE_NOT_FOUND');
  });

  it('returns 401 without token', async () => {
    const res = await request(app).post('/api/v1/vehicles/vehicle-1/purchase');
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('NO_TOKEN');
  });

  it('allows admin to purchase', async () => {
    setDbResult(mockVehicle);

    const res = await request(app)
      .post('/api/v1/vehicles/vehicle-1/purchase')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
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
    expect(res.body.code).toBe('FORBIDDEN');
  });

  it('returns 422 for quantity of 0', async () => {
    const res = await request(app)
      .post('/api/v1/vehicles/vehicle-1/restock')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quantity: 0 });

    expect(res.status).toBe(422);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('returns 422 for negative quantity', async () => {
    const res = await request(app)
      .post('/api/v1/vehicles/vehicle-1/restock')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quantity: -5 });

    expect(res.status).toBe(422);
  });

  it('returns 422 for non-integer quantity', async () => {
    const res = await request(app)
      .post('/api/v1/vehicles/vehicle-1/restock')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quantity: 1.5 });

    expect(res.status).toBe(422);
  });

  it('returns 422 for missing quantity', async () => {
    const res = await request(app)
      .post('/api/v1/vehicles/vehicle-1/restock')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});

    expect(res.status).toBe(422);
  });

  it('returns 404 for non-existent vehicle', async () => {
    setDbResult(null);

    const res = await request(app)
      .post('/api/v1/vehicles/nonexistent-id/restock')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quantity: 5 });

    expect(res.status).toBe(404);
    expect(res.body.code).toBe('VEHICLE_NOT_FOUND');
  });

  it('returns 401 without token', async () => {
    const res = await request(app)
      .post('/api/v1/vehicles/vehicle-1/restock')
      .send({ quantity: 5 });

    expect(res.status).toBe(401);
  });
});
