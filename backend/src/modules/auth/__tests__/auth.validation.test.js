const { loginSchema, refreshSchema } = require('../auth.validation');

describe('Auth Validation Schemas', () => {
  describe('loginSchema', () => {
    it('accepts valid email and password', () => {
      const { error } = loginSchema.validate({
        email: 'user@example.com',
        password: 'secret123',
      });
      expect(error).toBeUndefined();
    });

    it('rejects missing email', () => {
      const { error } = loginSchema.validate({ password: 'secret123' });
      expect(error).toBeDefined();
      expect(error.details[0].message).toMatch(/email/i);
    });

    it('rejects missing password', () => {
      const { error } = loginSchema.validate({ email: 'user@example.com' });
      expect(error).toBeDefined();
      expect(error.details[0].message).toMatch(/password/i);
    });

    it('rejects invalid email format', () => {
      const { error } = loginSchema.validate({
        email: 'not-an-email',
        password: 'secret123',
      });
      expect(error).toBeDefined();
      expect(error.details[0].message).toMatch(/email/i);
    });

    it('rejects password shorter than 6 characters', () => {
      const { error } = loginSchema.validate({
        email: 'user@example.com',
        password: '12345',
      });
      expect(error).toBeDefined();
      expect(error.details[0].message).toMatch(/password/i);
    });

    it('rejects password longer than 128 characters', () => {
      const { error } = loginSchema.validate({
        email: 'user@example.com',
        password: 'a'.repeat(129),
      });
      expect(error).toBeDefined();
      expect(error.details[0].message).toMatch(/password/i);
    });

    it('strips unknown fields', () => {
      const { value } = loginSchema.validate({
        email: 'user@example.com',
        password: 'secret123',
        extraField: 'should be stripped',
      });
      expect(value.extraField).toBeUndefined();
      expect(value.email).toBe('user@example.com');
    });

    it('rejects empty email string', () => {
      const { error } = loginSchema.validate({
        email: '',
        password: 'secret123',
      });
      expect(error).toBeDefined();
    });

    it('rejects empty password string', () => {
      const { error } = loginSchema.validate({
        email: 'user@example.com',
        password: '',
      });
      expect(error).toBeDefined();
    });
  });

  describe('registerSchema', () => {
    it('accepts valid name, email and password', () => {
      const { error } = require('../auth.validation').registerSchema.validate({
        name: 'John Doe', email: 'john@example.com', password: 'secret123',
      });
      expect(error).toBeUndefined();
    });

    it('rejects missing name', () => {
      const { error } = require('../auth.validation').registerSchema.validate({
        email: 'john@example.com', password: 'secret123',
      });
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('name');
    });

    it('rejects missing email', () => {
      const { error } = require('../auth.validation').registerSchema.validate({
        name: 'John', password: 'secret123',
      });
      expect(error).toBeDefined();
    });

    it('rejects missing password', () => {
      const { error } = require('../auth.validation').registerSchema.validate({
        name: 'John', email: 'john@example.com',
      });
      expect(error).toBeDefined();
    });

    it('rejects short password', () => {
      const { error } = require('../auth.validation').registerSchema.validate({
        name: 'John', email: 'john@example.com', password: '12345',
      });
      expect(error).toBeDefined();
    });

    it('rejects invalid email', () => {
      const { error } = require('../auth.validation').registerSchema.validate({
        name: 'John', email: 'not-email', password: 'secret123',
      });
      expect(error).toBeDefined();
    });

    it('strips unknown fields', () => {
      const { value, error } = require('../auth.validation').registerSchema.validate({
        name: 'John', email: 'john@example.com', password: 'secret123', extra: 'x',
      });
      expect(error).toBeUndefined();
      expect(value.extra).toBeUndefined();
    });
  });

  describe('refreshSchema', () => {
    it('accepts valid refresh token', () => {
      const { error } = refreshSchema.validate({
        refreshToken: 'some.jwt.token',
      });
      expect(error).toBeUndefined();
    });

    it('rejects missing refresh token', () => {
      const { error } = refreshSchema.validate({});
      expect(error).toBeDefined();
      expect(error.details[0].message).toMatch(/refreshToken/i);
    });

    it('rejects empty refresh token string', () => {
      const { error } = refreshSchema.validate({ refreshToken: '' });
      expect(error).toBeDefined();
    });

    it('strips unknown fields', () => {
      const { value } = refreshSchema.validate({
        refreshToken: 'valid.token',
        unknown: 'should be stripped',
      });
      expect(value.unknown).toBeUndefined();
      expect(value.refreshToken).toBe('valid.token');
    });
  });
});
