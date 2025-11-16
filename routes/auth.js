const express = require("express");
const router = express.Router();
const authService = require("../services/auth.service");

router.post("/login", async (req, res, next) => {
  try {
    const result = await authService.login(req.body.email, req.body.password);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.post("/register", async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
