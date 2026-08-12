// server/src/routes/exam.routes.js
const express = require("express");
const router = express.Router();
const {
  createSchedule,
  getSchedules,
  getSubjects,
  enterResults,
  getStudentResults,
  downloadMarksheet,
} = require("../controllers/exam.controller");
const { authenticate, authorize } = require("../middleware/auth");

const STAFF = ["ADMIN", "PRINCIPAL", "HOD", "FACULTY"];

router.use(authenticate);

router.post("/schedules", authorize(...STAFF), createSchedule);
router.get("/schedules", authorize(...STAFF, "STUDENT"), getSchedules);
router.get("/subjects", authorize(...STAFF, "STUDENT"), getSubjects); // विषय फेच करने के लिए नया राउट जोड़ा गया
router.post("/schedules/:id/results", authorize(...STAFF), enterResults);
router.get("/results/student/:studentId", authorize(...STAFF, "STUDENT"), getStudentResults);
router.get("/marksheet/:studentId", authorize(...STAFF, "STUDENT"), downloadMarksheet);

module.exports = router;