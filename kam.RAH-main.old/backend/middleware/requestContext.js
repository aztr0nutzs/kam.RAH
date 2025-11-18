const { randomUUID } = require('crypto');

const sanitizeRequestId = (value) => {
  if (!value || typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  return trimmed.slice(0, 128);
};

const requestContext = (req, res, next) => {
  const providedId = sanitizeRequestId(req.headers['x-request-id']);
  const requestId = providedId || randomUUID();
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
};

module.exports = { requestContext };
