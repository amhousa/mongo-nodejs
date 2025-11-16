// /utils/jwt.js
const jwt = require("jsonwebtoken");

const ACCESS_EXPIRES = "15m";
const REFRESH_EXPIRES = "7d";

module.exports = {
  signAccessToken: (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: ACCESS_EXPIRES,
    });
  },

  signRefreshToken: (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: REFRESH_EXPIRES,
    });
  },

  verifyAccessToken: (token) => {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return null;
    }
  },

  verifyRefreshToken: (token) => {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return null;
    }
  },

  setAuthCookies: (res, accessToken, refreshToken) => {
    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  },
};
