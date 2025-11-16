// utils/hash.js
import bcrypt from 'bcrypt';
const SALT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);

export const hashPassword = (password) => bcrypt.hash(password, SALT_ROUNDS);
export const comparePassword = (password, hash) => bcrypt.compare(password, hash);
