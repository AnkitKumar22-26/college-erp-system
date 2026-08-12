// server/src/routes/attendance.routes.js
const express = require("express");
const router = express.Router();

const {
  markStudentAttendance,
  getStudentAttendanceByDate,
  getStudentAttendanceReport,
  exportStudentAttendanceExcel,
  markFacultyAttendance,
  getFacultyAttendanceByDate,
  getMyAttendance, // <--- यहाँ इम्पोर्ट करें
} = require("../controllers/attendance.controller");

const { authenticate, authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  markStudentAttendanceSchema,
  markFacultyAttendanceSchema,
} = require("../validators/attendance.validator");

const MARK_ROLES = ["ADMIN", "PRINCIPAL", "HOD", "FACULTY"];
const VIEW_ROLES = [...MARK_ROLES, "STUDENT", "ACCOUNTANT", "RECEPTIONIST"];

router.use(authenticate);

// Student Attendance Routes
router.get(
  "/my-attendance",
  authorize("STUDENT"), // <--- केवल लॉगिन स्टूडेंट इसे देख सकता है
  getMyAttendance
);

router.post(
  "/students/mark",
  authorize(...MARK_ROLES),
  validate(markStudentAttendanceSchema),
  markStudentAttendance
);
router.get("/students", authorize(...VIEW_ROLES), getStudentAttendanceByDate);
router.get("/students/report", authorize(...VIEW_ROLES), getStudentAttendanceReport);
router.get("/students/export/excel", authorize(...MARK_ROLES), exportStudentAttendanceExcel);

// Faculty Attendance Routes
router.post(
  "/faculty/mark",
  authorize("ADMIN", "PRINCIPAL", "HOD"),
  validate(markFacultyAttendanceSchema),
  markFacultyAttendance
);
router.get("/faculty", authorize("ADMIN", "PRINCIPAL", "HOD"), getFacultyAttendanceByDate);

module.exports = router;