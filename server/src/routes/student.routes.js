// server/src/routes/student.routes.js
const express = require("express");
const router = express.Router();

const {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  promoteStudents,
  transferStudent,
  exportStudentsExcel,
} = require("../controllers/student.controller");

const { authenticate, authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { uploadStudentPhoto } = require("../middleware/upload");
const {
  studentCreateSchema,
  studentUpdateSchema,
  studentPromoteSchema,
  studentTransferSchema,
} = require("../validators/student.validator");

const STAFF_ROLES = ["ADMIN", "PRINCIPAL", "HOD", "RECEPTIONIST"];

router.use(authenticate);

router.get("/", authorize(...STAFF_ROLES, "FACULTY"), getStudents);
router.get("/export/excel", authorize(...STAFF_ROLES), exportStudentsExcel);
router.get("/:id", authorize(...STAFF_ROLES, "FACULTY", "STUDENT"), getStudentById);

router.post(
  "/",
  authorize(...STAFF_ROLES),
  uploadStudentPhoto.single("photo"),
  validate(studentCreateSchema),
  createStudent
);

router.put(
  "/:id",
  authorize(...STAFF_ROLES),
  uploadStudentPhoto.single("photo"),
  validate(studentUpdateSchema),
  updateStudent
);

router.delete("/:id", authorize("ADMIN", "PRINCIPAL"), deleteStudent);

router.post(
  "/promote",
  authorize("ADMIN", "PRINCIPAL", "HOD"),
  validate(studentPromoteSchema),
  promoteStudents
);

router.patch(
  "/:id/transfer",
  authorize("ADMIN", "PRINCIPAL", "HOD"),
  validate(studentTransferSchema),
  transferStudent
);

module.exports = router;
