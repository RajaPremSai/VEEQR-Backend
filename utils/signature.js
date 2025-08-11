const crypto = require('crypto');

const signPayload = (payload, secret) => {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  return hmac.digest('hex');
};

const verifySignature = (payload, signature, secret) => {
  const expected = signPayload(payload, secret);
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
};

module.exports = { signPayload, verifySignature }; 