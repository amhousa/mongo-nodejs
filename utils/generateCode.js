// utils/code.js
import crypto from 'crypto';

export const generateNumericCode = (len = 6) => {
  // امن‌تر از Math.random
  const bytes = crypto.randomBytes(Math.ceil(len/2)).toString('hex');
  return bytes.slice(0, len).replace(/[^0-9]/g, (c) => (c.charCodeAt(0) % 10)).slice(0,len);
};

export const generateSecureToken = (size = 48) =>
  crypto.randomBytes(size).toString('hex');
