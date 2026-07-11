const AppError = require('../shared/errors/AppError');
const { HTTP_STATUS } = require('../shared/constants/statusCodes');
const config = require('../config/env');

const handleJWTError = () => new AppError('Invalid token', HTTP_STATUS.UNAUTHORIZED, 'INVALID_TOKEN');
const handleJWTExpiredError = () => new AppError('Token expired', HTTP_STATUS.UNAUTHORIZED, 'TOKEN_EXPIRED');
const handleSupabaseError = (err) => {
  if (err.code === '23505') return new AppError('Duplicate entry', HTTP_STATUS.CONFLICT, 'DUPLICATE');
  if (err.code === '23503') return new AppError('Referenced resource not found', HTTP_STATUS.NOT_FOUND, 'FK_ERROR');
  if (err.code === 'PGRST104') return new AppError('Resource not found', HTTP_STATUS.NOT_FOUND, 'NOT_FOUND');
  if (err.code === 'PGRST205') return new AppError('Database table not found', HTTP_STATUS.INTERNAL_SERVER, 'DB_MISSING_TABLE');
  return new AppError('Database error', HTTP_STATUS.INTERNAL_SERVER, 'DB_ERROR');
};

const errorHandler = (err, req, res, _next) => {
  if (err.name === 'JsonWebTokenError') err = handleJWTError();
  if (err.name === 'TokenExpiredError') err = handleJWTExpiredError();
  if (err.code?.startsWith('PGRST') || err.name === 'PostgrestError' || err.code?.startsWith('23')) err = handleSupabaseError(err);

  err.statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER;
  err.code = err.code || 'INTERNAL_ERROR';

  const body = {
    success: false,
    message: err.isOperational ? err.message : 'Something went wrong',
    code: err.code,
  };

  if (config.NODE_ENV === 'development') {
    body.stack = err.stack;
  }

  res.status(err.statusCode).json(body);
};

module.exports = errorHandler;
