// server/src/routes/auth.routes.js
const express = require("express");
const router = express.Router();

const { login, refresh, logout, me, changePassword } = require("../controllers/auth.controller");
const { authenticate } = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  loginSchema,
  refreshSchema,
  changePasswordSchema,
} = require("../validators/auth.validator");

router.post("/login", validate(loginSchema), login);
router.post("/refresh", validate(refreshSchema), refresh);
router.post("/logout", logout);
router.get("/me", authenticate, me);
router.post("/change-password", authenticate, validate(changePasswordSchema), changePassword);

module.exports = router;
