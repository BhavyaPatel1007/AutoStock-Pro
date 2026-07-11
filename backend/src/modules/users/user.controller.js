const userService = require('./user.service');
const asyncHandler = require('../../shared/utils/asyncHandler');
const { sendSuccess } = require('../../shared/utils/response');
const { HTTP_STATUS } = require('../../shared/constants/statusCodes');

const list = asyncHandler(async (req, res) => {
  const { users, meta } = await userService.listUsers(req.query);
  sendSuccess(res, { data: users, meta });
});

const getById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  sendSuccess(res, { data: user });
});

const create = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body);
  sendSuccess(res, { statusCode: HTTP_STATUS.CREATED, data: user, message: 'User created' });
});

const update = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);
  sendSuccess(res, { data: user, message: 'User updated' });
});

const remove = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id);
  sendSuccess(res, { statusCode: HTTP_STATUS.NO_CONTENT });
});

module.exports = { list, getById, create, update, remove };
