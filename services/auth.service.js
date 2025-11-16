const pool = require("../db/pool");
const bcrypt = require("bcryptjs");
const { generateCode } = require("../utils/generateCode");
const { signAccessToken, signRefreshToken } = require("../utils/jwt");
const emailService = require("./email.service");

module.exports = {
  // مرحله ۱ ثبت‌نام
  sendRegisterCode: async (req, res) => {
    const { email } = req.body;

    const code = generateCode();
    const expires = new Date(Date.now() + 5 * 60 * 1000);

    const user = await pool.query("SELECT * FROM users WHERE email=$1", [email]);

    if (user.rows.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    await pool.query(
      `INSERT INTO verification_codes(user_id, code, purpose, expires_at)
       VALUES(NULL, $1, 'register', $2)`,
      [code, expires]
    );

    await emailService.sendVerificationEmail(email, code);

    res.json({ message: "Verification code sent" });
  },

  // مرحله ۲ ثبت‌نام
  verifyCodeAndCreateUser: async (req, res) => {
    const { email, username, password, code } = req.body;

    const result = await pool.query(
      `SELECT * FROM verification_codes
       WHERE code = $1 AND purpose='register' AND is_used=false
         AND expires_at > NOW() LIMIT 1`,
      [code]
    );

    if (result.rows.length === 0)
      return res.status(400).json({ message: "Invalid or expired code" });

    const password_hash = await bcrypt.hash(password, 12);

    const newUser = await pool.query(
      `INSERT INTO users(email, username, password_hash, is_email_verified)
       VALUES($1, $2, $3, true) RETURNING *`,
      [email, username, password_hash]
    );

    await pool.query(
      `UPDATE verification_codes SET is_used=true WHERE id=$1`,
      [result.rows[0].id]
    );

    res.json({ message: "Account created", user: newUser.rows[0] });
  },

  // ورود
  login: async (req, res) => {
    const { email, password } = req.body;

    const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    const user = result.rows[0];

    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);

    res.json({ accessToken, refreshToken, user });
  },

  // درخواست ریکاوری
  forgotPassword: async (req, res) => {
    const { email } = req.body;

    const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (result.rows.length === 0)
      return res.status(404).json({ message: "User not found" });

    const code = generateCode();
    const expires = new Date(Date.now() + 5 * 60 * 1000);

    await pool.query(
      `INSERT INTO password_resets(user_id, reset_code, expires_at)
       VALUES($1, $2, $3)`,
      [result.rows[0].id, code, expires]
    );

    await emailService.sendResetPassword(email, code);

    res.json({ message: "Reset code sent" });
  },

  // ریست رمز
  resetPassword: async (req, res) => {
    const { email, code, newPassword } = req.body;

    const userQuery = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    const user = userQuery.rows[0];

    const c = await pool.query(
      `SELECT * FROM password_resets
       WHERE user_id=$1 AND reset_code=$2 AND is_used=false AND expires_at>NOW()`,
      [user.id, code]
    );

    if (c.rows.length === 0)
      return res.status(400).json({ message: "Invalid or expired code" });

    const hash = await bcrypt.hash(newPassword, 12);

    await pool.query(`UPDATE users SET password_hash=$1 WHERE id=$2`, [hash, user.id]);
    await pool.query(`UPDATE password_resets SET is_used=true WHERE id=$1`, [c.rows[0].id]);

    res.json({ message: "Password updated" });
  },

  logout: async (req, res) => {
    res.json({ message: "Logged out" });
  },
};
