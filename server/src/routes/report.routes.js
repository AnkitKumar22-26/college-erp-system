// server/src/routes/report.routes.js
const express = require("express");
const router = express.Router();
const {
  studentReport,
  facultyReport,
  libraryReport,
  placementReport,
} = require("../controllers/report.controller");
const { authenticate, authorize } = require("../middleware/auth");

const REPORT_ROLES = ["ADMIN", "PRINCIPAL", "HOD"];

router.use(authenticate, authorize(...REPORT_ROLES));

router.get("/students/excel", studentReport);
router.get("/faculty/excel", facultyReport);
router.get("/library/excel", libraryReport);
router.get("/placements/excel", placementReport);

module.exports = router;
