const express = require("express");
const router = express.Router();
const {
  handleLogin,
  handleLogout,
  handleRefreshToken,
} = require("../controllers/authController");

// POST /auth/login
router.post("/login", handleLogin);

// GET /auth/refresh
router.get("/refresh", handleRefreshToken);

// POST /auth/logout
router.post("/logout", handleLogout);

module.exports = router;
