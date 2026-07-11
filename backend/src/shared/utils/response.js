const sendSuccess = (res, { statusCode = 200, data = null, message, meta, token } = {}) => {
  const body = { success: true };
  if (message) body.message = message;
  if (data !== null) body.data = data;
  if (meta) body.meta = meta;
  if (token) body.token = token;
  return res.status(statusCode).json(body);
};

module.exports = { sendSuccess };
