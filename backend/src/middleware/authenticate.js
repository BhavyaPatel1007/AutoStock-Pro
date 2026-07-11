const jwt = require('jsonwebtoken');
const AppError = require('../shared/errors/AppError');
const { HTTP_STATUS } = require('../shared/constants/statusCodes');
const config = require('../config/env');

const authenticate = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError('No token provided', HTTP_STATUS.UNAUTHORIZED, 'NO_TOKEN'));
  }

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.JWT_ACCESS_SECRET);
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Token expired', HTTP_STATUS.UNAUTHORIZED, 'TOKEN_EXPIRED'));
    }
    return next(new AppError('Invalid token', HTTP_STATUS.UNAUTHORIZED, 'INVALID_TOKEN'));
  }
};

module.exports = authenticate;
