// server/src/routes/account.routes.js
const express = require("express");
const router = express.Router();
const {
  createExpense,
  getExpenses,
  createIncome,
  getIncomes,
  getSummary,
} = require("../controllers/account.controller");
const { authenticate, authorize } = require("../middleware/auth");

const FINANCE_ROLES = ["ADMIN", "PRINCIPAL", "ACCOUNTANT"];

router.use(authenticate, authorize(...FINANCE_ROLES));

router.post("/expenses", createExpense);
router.get("/expenses", getExpenses);
router.post("/incomes", createIncome);
router.get("/incomes", getIncomes);
router.get("/summary", getSummary);

module.exports = router;
