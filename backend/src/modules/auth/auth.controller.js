const authService = require('./auth.service');
const asyncHandler = require('../../shared/utils/asyncHandler');
const { sendSuccess } = require('../../shared/utils/response');
const { HTTP_STATUS } = require('../../shared/constants/statusCodes');

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const data = await authService.login(email, password);
  sendSuccess(res, { statusCode: HTTP_STATUS.OK, data, message: 'Login successful' });
});

const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const data = await authService.refreshAccessToken(refreshToken);
  sendSuccess(res, { statusCode: HTTP_STATUS.OK, data, message: 'Token refreshed' });
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user.id);
  sendSuccess(res, { statusCode: HTTP_STATUS.OK, message: 'Logged out successfully' });
});

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const data = await authService.register(name, email, password);
  sendSuccess(res, { statusCode: HTTP_STATUS.CREATED, data, message: 'Registration successful' });
});

module.exports = { login, register, refresh, logout };
