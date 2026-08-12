// server/src/routes/fee.routes.js
const express = require("express");
const router = express.Router();

const {
  createFeeStructure,
  getFeeStructures,
  assignFee,
  getStudentFees,
  getPendingFees,
  collectFee,
  downloadReceipt,
  exportFeesExcel,
} = require("../controllers/fee.controller");

const { authenticate, authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  feeStructureCreateSchema,
  assignFeeSchema,
  collectFeeSchema,
} = require("../validators/fee.validator");

const FINANCE_ROLES = ["ADMIN", "PRINCIPAL", "ACCOUNTANT"];

router.use(authenticate);

router.post(
  "/structures",
  authorize(...FINANCE_ROLES),
  validate(feeStructureCreateSchema),
  createFeeStructure
);
router.get("/structures", authorize(...FINANCE_ROLES, "HOD"), getFeeStructures);

router.post("/assign", authorize(...FINANCE_ROLES), validate(assignFeeSchema), assignFee);
router.get("/pending", authorize(...FINANCE_ROLES), getPendingFees);
router.get("/export/excel", authorize(...FINANCE_ROLES), exportFeesExcel);
router.get("/student/:studentId", authorize(...FINANCE_ROLES, "STUDENT", "HOD"), getStudentFees);

router.post("/collect", authorize(...FINANCE_ROLES), validate(collectFeeSchema), collectFee);
router.get("/receipt/:paymentId", authorize(...FINANCE_ROLES, "STUDENT"), downloadReceipt);

module.exports = router;
