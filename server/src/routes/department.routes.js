// server/src/routes/department.routes.js
const express = require("express");
const router = express.Router();

const {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  assignHod,
  getDepartmentSubjects,
  createSubject,
} = require("../controllers/department.controller");

const { authenticate, authorize } = require("../middleware/auth");

router.use(authenticate);

router.get("/", getDepartments);
router.get("/:id", getDepartmentById);
router.get("/:id/subjects", getDepartmentSubjects);

router.post("/", authorize("ADMIN", "PRINCIPAL"), createDepartment);
router.put("/:id", authorize("ADMIN", "PRINCIPAL"), updateDepartment);
router.delete("/:id", authorize("ADMIN", "PRINCIPAL"), deleteDepartment);
router.post("/:id/assign-hod", authorize("ADMIN", "PRINCIPAL"), assignHod);
router.post("/:id/subjects", authorize("ADMIN", "PRINCIPAL", "HOD"), createSubject);

module.exports = router;
