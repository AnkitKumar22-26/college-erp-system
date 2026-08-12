// server/src/routes/faculty.routes.js
const express = require("express");
const router = express.Router();

const {
  getFacultyList,
  getFacultyById,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  exportFacultyExcel,
} = require("../controllers/faculty.controller");

const { authenticate, authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { uploadFacultyPhoto } = require("../middleware/upload");
const { facultyCreateSchema, facultyUpdateSchema } = require("../validators/faculty.validator");

const MANAGE_ROLES = ["ADMIN", "PRINCIPAL", "HOD"];

router.use(authenticate);

router.get("/", authorize(...MANAGE_ROLES, "ACCOUNTANT"), getFacultyList);
router.get("/export/excel", authorize(...MANAGE_ROLES), exportFacultyExcel);
router.get("/:id", authorize(...MANAGE_ROLES, "ACCOUNTANT", "FACULTY"), getFacultyById);

router.post(
  "/",
  authorize(...MANAGE_ROLES),
  uploadFacultyPhoto.single("photo"),
  validate(facultyCreateSchema),
  createFaculty
);

router.put(
  "/:id",
  authorize(...MANAGE_ROLES),
  uploadFacultyPhoto.single("photo"),
  validate(facultyUpdateSchema),
  updateFaculty
);

router.delete("/:id", authorize("ADMIN", "PRINCIPAL"), deleteFaculty);

module.exports = router;
