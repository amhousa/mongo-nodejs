// /services/user.service.js
const pool = require("../db/pool");

module.exports = {
  findByEmail: async (email) => {
    const res = await pool.query(
      "SELECT * FROM users WHERE email=$1 LIMIT 1",
      [email]
    );
    return res.rows[0];
  },

  findByUsername: async (username) => {
    const res = await pool.query(
      "SELECT * FROM users WHERE username=$1 LIMIT 1",
      [username]
    );
    return res.rows[0];
  },

  findById: async (id) => {
    const res = await pool.query(
      "SELECT * FROM users WHERE id=$1 LIMIT 1",
      [id]
    );
    return res.rows[0];
  },

  createUser: async ({ email, username, password_hash }) => {
    const result = await pool.query(
      `INSERT INTO users (email, username, password_hash, is_email_verified)
       VALUES ($1, $2, $3, true)
       RETURNING *`,
      [email, username, password_hash]
    );
    return result.rows[0];
  },

  updatePassword: async (userId, newHash) => {
    await pool.query(
      `UPDATE users SET password_hash=$1, updated_at=NOW() WHERE id=$2`,
      [newHash, userId]
    );
  },

  markEmailVerified: async (userId) => {
    await pool.query(
      `UPDATE users SET is_email_verified=true WHERE id=$1`,
      [userId]
    );
  },
};
