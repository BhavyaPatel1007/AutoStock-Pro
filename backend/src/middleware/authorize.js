const AppError = require('../shared/errors/AppError');
const { HTTP_STATUS } = require('../shared/constants/statusCodes');

const authorize = (...allowedRoles) => (req, _res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return next(new AppError('Insufficient permissions', HTTP_STATUS.FORBIDDEN, 'FORBIDDEN'));
  }
  next();
};

module.exports = authorize;
