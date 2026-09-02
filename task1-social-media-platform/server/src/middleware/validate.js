const { validationResult } = require('express-validator');
const { BadRequestError } = require('../utils/errors');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors
      .array()
      .map((e) => e.msg)
      .join(', ');
    return next(new BadRequestError(message));
  }
  next();
};

module.exports = validate;
