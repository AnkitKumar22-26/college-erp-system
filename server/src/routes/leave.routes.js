// server/src/routes/leave.routes.js
const express = require("express");
const router = express.Router();
const { applyLeave, getLeaves, updateLeaveStatus } = require("../controllers/leave.controller");
const { authenticate, authorize } = require("../middleware/auth");

router.use(authenticate);

router.post("/", applyLeave);
router.get("/", getLeaves);
// यहाँ "FACULTY" को भी शामिल कर दें
router.patch("/:id/status", authorize("ADMIN", "PRINCIPAL", "HOD", "FACULTY"), updateLeaveStatus);

module.exports = router;