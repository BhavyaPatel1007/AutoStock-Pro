const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authRepo = require('./auth.repository');
const AppError = require('../../shared/errors/AppError');
const { HTTP_STATUS } = require('../../shared/constants/statusCodes');
const config = require('../../config/env');

const generateAccessToken = (user) =>
  jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    config.JWT_ACCESS_SECRET,
    { expiresIn: config.JWT_ACCESS_EXPIRES_IN }
  );

const generateRefreshToken = (user) =>
  jwt.sign(
    { sub: user.id },
    config.JWT_REFRESH_SECRET,
    { expiresIn: config.JWT_REFRESH_EXPIRES_IN }
  );

const login = async (email, password) => {
  const user = await authRepo.findByEmail(email);
  if (!user) throw new AppError('Invalid credentials', HTTP_STATUS.UNAUTHORIZED, 'INVALID_CREDENTIALS');

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) throw new AppError('Invalid credentials', HTTP_STATUS.UNAUTHORIZED, 'INVALID_CREDENTIALS');

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await authRepo.updateRefreshToken(user.id, refreshToken);

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  };
};

const refreshAccessToken = async (token) => {
  let payload;
  try {
    payload = jwt.verify(token, config.JWT_REFRESH_SECRET);
  } catch {
    throw new AppError('Invalid refresh token', HTTP_STATUS.UNAUTHORIZED, 'INVALID_REFRESH_TOKEN');
  }

  const user = await authRepo.findByRefreshToken(token);
  if (!user) throw new AppError('Refresh token revoked', HTTP_STATUS.UNAUTHORIZED, 'TOKEN_REVOKED');

  const accessToken = generateAccessToken(user);
  return { accessToken };
};

const logout = async (userId) => {
  await authRepo.updateRefreshToken(userId, null);
};

const register = async (name, email, password) => {
  const existing = await authRepo.findByEmail(email);
  if (existing) throw new AppError('Email already in use', HTTP_STATUS.CONFLICT, 'EMAIL_EXISTS');

  const password_hash = await bcrypt.hash(password, config.BCRYPT_SALT_ROUNDS);
  const user = await authRepo.create({ email, password_hash, name, role: 'user' });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await authRepo.updateRefreshToken(user.id, refreshToken);

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  };
};

module.exports = { login, refreshAccessToken, logout, register };
