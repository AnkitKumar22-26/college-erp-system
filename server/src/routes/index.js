// server/src/routes/index.js
const express = require("express");
const router = express.Router();

router.use("/auth", require("./auth.routes"));
router.use("/dashboard", require("./dashboard.routes"));
router.use("/students", require("./student.routes"));
router.use("/faculty", require("./faculty.routes"));
router.use("/departments", require("./department.routes"));
router.use("/attendance", require("./attendance.routes"));
router.use("/fees", require("./fee.routes"));
router.use("/exams", require("./exam.routes"));
router.use("/library", require("./library.routes"));
router.use("/hostel", require("./hostel.routes"));
router.use("/transport", require("./transport.routes"));
router.use("/notices", require("./notice.routes"));
router.use("/timetable", require("./timetable.routes"));
router.use("/leaves", require("./leave.routes"));
router.use("/placements", require("./placement.routes"));
router.use("/accounts", require("./account.routes"));
router.use("/reports", require("./report.routes"));
router.use("/settings", require("./settings.routes"));

module.exports = router;
