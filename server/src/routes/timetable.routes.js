// server/src/routes/timetable.routes.js
const express = require("express");
const router = express.Router();
const {
  createTimetable,
  getTimetables,
  addSlot,
  getFacultyTimetable,
} = require("../controllers/timetable.controller");
const { authenticate, authorize } = require("../middleware/auth");

const ADMIN_ROLES = ["ADMIN", "PRINCIPAL", "HOD"];

router.use(authenticate);

router.post("/", authorize(...ADMIN_ROLES), createTimetable);
router.get("/", getTimetables);
router.post("/:id/slots", authorize(...ADMIN_ROLES), addSlot);
router.get("/faculty/:facultyId", getFacultyTimetable);

module.exports = router;
