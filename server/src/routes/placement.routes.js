// server/src/routes/placement.routes.js
const express = require("express");
const router = express.Router();
const {
  createCompany,
  getCompanies,
  createDrive,
  getDrives,
  selectStudent,
  getSelectedStudents,
} = require("../controllers/placement.controller");
const { authenticate, authorize } = require("../middleware/auth");

const ADMIN_ROLES = ["ADMIN", "PRINCIPAL", "HOD"];

router.use(authenticate);

router.post("/companies", authorize(...ADMIN_ROLES), createCompany);
router.get("/companies", getCompanies);
router.post("/drives", authorize(...ADMIN_ROLES), createDrive);
router.get("/drives", getDrives);
router.post("/drives/:id/select", authorize(...ADMIN_ROLES), selectStudent);
router.get("/selected", getSelectedStudents);

module.exports = router;
