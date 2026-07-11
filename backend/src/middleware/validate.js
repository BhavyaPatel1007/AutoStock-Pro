const AppError = require('../shared/errors/AppError');
const { HTTP_STATUS } = require('../shared/constants/statusCodes');

const validate = (schema, source = 'body') => (req, _res, next) => {
  const { error, value } = schema.validate(req[source], {
    abortEarly: false,
    stripUnknown: true,
    allowUnknown: false,
  });

  if (error) {
    const messages = error.details.map((d) => d.message);
    return next(new AppError(messages.join('; '), HTTP_STATUS.UNPROCESSABLE, 'VALIDATION_ERROR'));
  }

  req[source] = value;
  next();
};

module.exports = validate;
