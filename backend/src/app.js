const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const config = require('./config/env');
const v1Routes = require('./routes/v1');
const errorHandler = require('./middleware/errorHandler');
const AppError = require('./shared/errors/AppError');
const { HTTP_STATUS } = require('./shared/constants/statusCodes');

const app = express();

// Security
app.use(helmet());
app.use(cors({ origin: config.CORS_ORIGIN, credentials: true }));

// Rate limiting
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests', code: 'RATE_LIMIT' },
  })
);

// Parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Performance
app.use(compression());

// Logging
if (config.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// API routes
app.use('/api/v1', v1Routes);

// 404 handler
app.all('*', (req, _res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, HTTP_STATUS.NOT_FOUND, 'ROUTE_NOT_FOUND'));
});

// Global error handler
app.use(errorHandler);

module.exports = app;
