// ── Env must be set before any module loads ─────────────
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
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// ── Mock database module ────────────────────────────────
jest.mock('../../../config/database', () => {
  let mockResult = { data: null, error: null, count: null };

  const chain = {
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
  };

  const supabase = { from: jest.fn(() => chain) };
  supabase.__setMockResult = (r) => { mockResult = r; };
  supabase.__resetMocks = () => {
    mockResult = { data: null, error: null, count: null };
  };
  return supabase;
});

const mockDb = require('../../../config/database');

// ── Test app (lightweight, no rate-limit / helmet) ─────
const errorHandler = require('../../../middleware/errorHandler');
const authRoutes = require('../auth.routes');

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/auth', authRoutes);
  app.use(errorHandler);
  return app;
};

// ── Helpers ──────────────────────────────────────────────
const mockUser = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'user@example.com',
  name: 'Test User',
  role: 'user',
  password_hash: bcrypt.hashSync('ValidPass123', 4),
};

const validAccessToken = jwt.sign(
  { sub: mockUser.id, email: mockUser.email, role: mockUser.role },
  process.env.JWT_ACCESS_SECRET,
  { expiresIn: '15m' }
);

const setDbResult = (data, error = null) => {
  mockDb.__setMockResult({ data, error, count: null });
};

describe('POST /api/v1/auth/register', () => {
  let app;
  beforeAll(() => { app = createApp(); });
  beforeEach(() => { mockDb.__resetMocks(); });

  it('returns 201 with tokens for valid registration', async () => {
    const chain = mockDb.from();
    chain.single
      .mockImplementationOnce(() => Promise.resolve({ data: null, error: null }))
      .mockImplementationOnce(() => Promise.resolve({
        data: { id: 'new-id', email: 'new@test.com', name: 'New', role: 'user' },
        error: null,
      }));

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'New User', email: 'new@test.com', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data).toHaveProperty('refreshToken');
    expect(res.body.data.user.role).toBe('user');
  });

  it('returns 409 when email already exists', async () => {
    setDbResult({ id: 'existing', email: 'dup@test.com' });

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Dup', email: 'dup@test.com', password: 'password123' });

    expect(res.status).toBe(409);
    expect(res.body.code).toBe('EMAIL_EXISTS');
  });

  it('returns 422 for missing name', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'test@test.com', password: 'password123' });
    expect(res.status).toBe(422);
  });

  it('returns 422 for missing email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Test', password: 'password123' });
    expect(res.status).toBe(422);
  });

  it('returns 422 for short password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Test', email: 'test@test.com', password: '12345' });
    expect(res.status).toBe(422);
  });

  it('returns 422 for empty body', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({});
    expect(res.status).toBe(422);
  });
});

describe('POST /api/v1/auth/login', () => {
  let app;

  beforeAll(() => { app = createApp(); });
  beforeEach(() => { mockDb.__resetMocks(); });

  it('returns 200 with tokens for valid credentials', async () => {
    setDbResult(mockUser);

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'user@example.com', password: 'ValidPass123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data).toHaveProperty('refreshToken');
    expect(res.body.data.user).toEqual({
      id: mockUser.id,
      email: mockUser.email,
      name: mockUser.name,
      role: mockUser.role,
    });
  });

  it('returns 401 for unknown email', async () => {
    setDbResult(null);

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'unknown@example.com', password: 'ValidPass123' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('INVALID_CREDENTIALS');
  });

  it('returns 401 for wrong password', async () => {
    setDbResult(mockUser);

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'user@example.com', password: 'WrongPassword' });

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('INVALID_CREDENTIALS');
  });

  it('returns 422 for missing email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ password: 'ValidPass123' });

    expect(res.status).toBe(422);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('returns 422 for missing password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'user@example.com' });

    expect(res.status).toBe(422);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('returns 422 for invalid email format', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'not-an-email', password: 'ValidPass123' });

    expect(res.status).toBe(422);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('returns 422 for short password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'user@example.com', password: '12345' });

    expect(res.status).toBe(422);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('returns 422 for empty request body', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({});

    expect(res.status).toBe(422);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('does not expose password_hash in response', async () => {
    setDbResult(mockUser);

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'user@example.com', password: 'ValidPass123' });

    expect(res.body.data.user).not.toHaveProperty('password_hash');
  });

  it('returns 500 when database throws', async () => {
    mockDb.__setMockResult({
      data: null,
      error: new Error('DB connection failed'),
      count: null,
    });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'user@example.com', password: 'ValidPass123' });

    expect(res.status).toBe(500);
  });
});

describe('POST /api/v1/auth/refresh', () => {
  let app;
  const validRefreshToken = jwt.sign(
    { sub: mockUser.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  beforeAll(() => { app = createApp(); });
  beforeEach(() => { mockDb.__resetMocks(); });

  it('returns 200 with a new access token for a valid refresh token', async () => {
    setDbResult(mockUser);

    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: validRefreshToken });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('accessToken');
  });

  it('returns 401 when refresh token is expired', async () => {
    const expiredToken = jwt.sign(
      { sub: mockUser.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '0s' }
    );

    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: expiredToken });

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('INVALID_REFRESH_TOKEN');
  });

  it('returns 401 when refresh token is revoked', async () => {
    setDbResult(null);

    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: validRefreshToken });

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('TOKEN_REVOKED');
  });

  it('returns 401 for malformed refresh token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: 'not-a-valid-jwt' });

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('INVALID_REFRESH_TOKEN');
  });

  it('returns 422 for missing refreshToken field', async () => {
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({});

    expect(res.status).toBe(422);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });
});

describe('POST /api/v1/auth/logout', () => {
  let app;

  beforeAll(() => { app = createApp(); });
  beforeEach(() => { mockDb.__resetMocks(); });

  it('returns 200 when authenticated user logs out', async () => {
    const res = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${validAccessToken}`)
      .send();

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Logged out successfully');
  });

  it('returns 401 when no token is provided', async () => {
    const res = await request(app)
      .post('/api/v1/auth/logout')
      .send();

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('NO_TOKEN');
  });

  it('returns 401 when token is expired', async () => {
    const expiredToken = jwt.sign(
      { sub: mockUser.id, email: mockUser.email, role: mockUser.role },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '0s' }
    );

    const res = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${expiredToken}`)
      .send();

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('TOKEN_EXPIRED');
  });

  it('returns 401 for malformed token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', 'Bearer not-a-valid-token')
      .send();

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('INVALID_TOKEN');
  });

  it('returns 401 when Authorization header is missing Bearer prefix', async () => {
    const res = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', validAccessToken)
      .send();

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('NO_TOKEN');
  });

  it('returns 401 when Authorization header is missing entirely', async () => {
    const res = await request(app)
      .post('/api/v1/auth/logout')
      .send();

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('NO_TOKEN');
  });
});
