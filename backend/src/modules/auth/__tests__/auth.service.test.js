const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// ── Env must be set before any module loads ─────────────
process.env.JWT_ACCESS_SECRET = 'test-access-secret-long-enough-for-jwt';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-long-enough-for-jwt';
process.env.JWT_ACCESS_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_KEY = 'test-key';
process.env.SUPABASE_SECRET_KEY = 'test-key';
process.env.BCRYPT_SALT_ROUNDS = '4';
process.env.NODE_ENV = 'test';

jest.mock('../auth.repository');
const authRepo = require('../auth.repository');

const authService = require('../auth.service');

describe('Auth Service', () => {
  const mockUser = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'user@example.com',
    name: 'Test User',
    role: 'user',
    password_hash: bcrypt.hashSync('validPassword123', 4),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('returns accessToken, refreshToken, and user on valid credentials', async () => {
      authRepo.findByEmail.mockResolvedValue(mockUser);
      authRepo.updateRefreshToken.mockResolvedValue();

      const result = await authService.login('user@example.com', 'validPassword123');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
      });
      expect(authRepo.updateRefreshToken).toHaveBeenCalledWith(
        mockUser.id,
        expect.any(String)
      );
    });

    it('throws 401 when user is not found', async () => {
      authRepo.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login('unknown@example.com', 'anyPassword')
      ).rejects.toMatchObject({
        statusCode: 401,
        code: 'INVALID_CREDENTIALS',
      });
    });

    it('throws 401 when password is incorrect', async () => {
      authRepo.findByEmail.mockResolvedValue(mockUser);

      await expect(
        authService.login('user@example.com', 'wrongPassword')
      ).rejects.toMatchObject({
        statusCode: 401,
        code: 'INVALID_CREDENTIALS',
      });
    });

    it('generates valid JWT tokens on successful login', async () => {
      authRepo.findByEmail.mockResolvedValue(mockUser);
      authRepo.updateRefreshToken.mockResolvedValue();

      const result = await authService.login('user@example.com', 'validPassword123');

      const decodedAccess = jwt.verify(
        result.accessToken,
        process.env.JWT_ACCESS_SECRET
      );
      expect(decodedAccess.sub).toBe(mockUser.id);
      expect(decodedAccess.email).toBe(mockUser.email);
      expect(decodedAccess.role).toBe(mockUser.role);

      const decodedRefresh = jwt.verify(
        result.refreshToken,
        process.env.JWT_REFRESH_SECRET
      );
      expect(decodedRefresh.sub).toBe(mockUser.id);
    });

    it('does not return password_hash in result', async () => {
      authRepo.findByEmail.mockResolvedValue(mockUser);
      authRepo.updateRefreshToken.mockResolvedValue();

      const result = await authService.login('user@example.com', 'validPassword123');

      expect(result.user).not.toHaveProperty('password_hash');
    });
  });

  describe('refreshAccessToken', () => {
    const mockRefreshToken = jwt.sign(
      { sub: mockUser.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    it('returns a new access token for a valid refresh token', async () => {
      authRepo.findByRefreshToken.mockResolvedValue(mockUser);

      const result = await authService.refreshAccessToken(mockRefreshToken);

      expect(result).toHaveProperty('accessToken');

      const decoded = jwt.verify(result.accessToken, process.env.JWT_ACCESS_SECRET);
      expect(decoded.sub).toBe(mockUser.id);
    });

    it('throws 401 when refresh token is expired', async () => {
      const expiredToken = jwt.sign(
        { sub: mockUser.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '0s' }
      );

      await expect(
        authService.refreshAccessToken(expiredToken)
      ).rejects.toMatchObject({
        statusCode: 401,
        code: 'INVALID_REFRESH_TOKEN',
      });
    });

    it('throws 401 when refresh token is revoked (not in DB)', async () => {
      authRepo.findByRefreshToken.mockResolvedValue(null);

      await expect(
        authService.refreshAccessToken(mockRefreshToken)
      ).rejects.toMatchObject({
        statusCode: 401,
        code: 'TOKEN_REVOKED',
      });
    });

    it('throws 401 when refresh token is malformed', async () => {
      await expect(
        authService.refreshAccessToken('not-a-valid-jwt')
      ).rejects.toMatchObject({
        statusCode: 401,
        code: 'INVALID_REFRESH_TOKEN',
      });
    });
  });

  describe('register', () => {
    it('creates a new user and returns tokens', async () => {
      authRepo.findByEmail.mockResolvedValue(null);
      authRepo.create.mockResolvedValue({
        id: 'new-user-id', email: 'new@example.com', name: 'New User', role: 'user',
      });
      authRepo.updateRefreshToken.mockResolvedValue();

      const result = await authService.register('New User', 'new@example.com', 'password123');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user).toMatchObject({ email: 'new@example.com', role: 'user' });
      expect(authRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'new@example.com', name: 'New User', role: 'user' })
      );
    });

    it('throws 409 when email already exists', async () => {
      authRepo.findByEmail.mockResolvedValue({ id: 'existing', email: 'dup@example.com' });

      await expect(
        authService.register('Dup', 'dup@example.com', 'password123')
      ).rejects.toMatchObject({ statusCode: 409, code: 'EMAIL_EXISTS' });

      expect(authRepo.create).not.toHaveBeenCalled();
    });

    it('assigns default role of user', async () => {
      authRepo.findByEmail.mockResolvedValue(null);
      authRepo.create.mockResolvedValue({
        id: 'u2', email: 'u@example.com', name: 'U', role: 'user',
      });
      authRepo.updateRefreshToken.mockResolvedValue();

      const result = await authService.register('U', 'u@example.com', 'password123');

      expect(result.user.role).toBe('user');
    });
  });

  describe('logout', () => {
    it('clears the refresh token in the database', async () => {
      authRepo.updateRefreshToken.mockResolvedValue();

      await authService.logout(mockUser.id);

      expect(authRepo.updateRefreshToken).toHaveBeenCalledWith(mockUser.id, null);
    });

    it('does not throw when called with a valid user id', async () => {
      authRepo.updateRefreshToken.mockResolvedValue();

      await expect(authService.logout(mockUser.id)).resolves.not.toThrow();
    });
  });
});
