const bcrypt = require('bcrypt');
const userRepo = require('./user.repository');
const AppError = require('../../shared/errors/AppError');
const { HTTP_STATUS } = require('../../shared/constants/statusCodes');
const { getPagination, getMeta } = require('../../shared/utils/pagination');
const config = require('../../config/env');

const listUsers = async (query) => {
  const { page, limit, offset } = getPagination(query);
  const [users, total] = await Promise.all([
    userRepo.findAll({ offset, limit }),
    userRepo.count(),
  ]);
  return { users, meta: getMeta(total, page, limit) };
};

const getUserById = async (id) => {
  const user = await userRepo.findById(id);
  if (!user) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND, 'USER_NOT_FOUND');
  return user;
};

const createUser = async (payload) => {
  const existing = await userRepo.findByEmail(payload.email);
  if (existing) throw new AppError('Email already in use', HTTP_STATUS.CONFLICT, 'EMAIL_EXISTS');

  const password_hash = await bcrypt.hash(payload.password, config.BCRYPT_SALT_ROUNDS);
  return userRepo.create({
    email: payload.email,
    password_hash,
    name: payload.name,
    role: payload.role,
  });
};

const updateUser = async (id, payload) => {
  if (payload.email) {
    const existing = await userRepo.findByEmail(payload.email);
    if (existing && existing.id !== id) {
      throw new AppError('Email already in use', HTTP_STATUS.CONFLICT, 'EMAIL_EXISTS');
    }
  }
  const user = await userRepo.update(id, payload);
  if (!user) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND, 'USER_NOT_FOUND');
  return user;
};

const deleteUser = async (id) => {
  await getUserById(id);
  await userRepo.remove(id);
};

module.exports = { listUsers, getUserById, createUser, updateUser, deleteUser };
