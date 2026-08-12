// server/src/routes/dashboard.routes.js
const express = require("express");
const router = express.Router();

const {
  getStats,
  getAttendanceChart,
  getFeeChart,
  getDepartmentChart,
} = require("../controllers/dashboard.controller");

const { authenticate } = require("../middleware/auth");

router.use(authenticate);

router.get("/stats", getStats);
router.get("/charts/attendance", getAttendanceChart);
router.get("/charts/fees", getFeeChart);
router.get("/charts/departments", getDepartmentChart);

module.exports = router;
