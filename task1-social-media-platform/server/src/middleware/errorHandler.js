const { AppError } = require('../utils/errors');
const config = require('../config');

const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Prisma known errors
  if (err.code === 'P2002') {
    statusCode = 409;
    const field = err.meta?.target?.[0] || 'field';
    message = `${field} already exists`;
  }

  if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Record not found';
  }

  // Validation errors from express-validator
  if (err.name === 'ValidationError' || Array.isArray(err.errors)) {
    statusCode = 400;
    message = err.message || 'Validation failed';
  }

  if (config.nodeEnv === 'development') {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
};

const notFound = (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
};

module.exports = {
  errorHandler,
  notFound,
};
