// server/src/controllers/account.controller.js
const { z } = require("zod");
const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const { getPagination, buildPaginatedResponse } = require("../utils/pagination");

const entrySchema = z.object({
  title: z.string().min(1),
  category: z.string().min(1),
  amount: z.coerce.number().positive(),
  date: z.coerce.date().optional(),
});

// POST /api/accounts/expenses
const createExpense = asyncHandler(async (req, res) => {
  const data = entrySchema.parse(req.body);
  const expense = await prisma.expense.create({
    data: { ...data, recordedById: req.user.id },
  });
  res.status(201).json({ success: true, data: expense, message: "Expense recorded" });
});

// GET /api/accounts/expenses
const getExpenses = asyncHandler(async (req, res) => {
  const { page, limit, skip, take } = getPagination(req.query);
  const [expenses, total] = await Promise.all([
    prisma.expense.findMany({ skip, take, orderBy: { date: "desc" } }),
    prisma.expense.count(),
  ]);
  res.json({ success: true, ...buildPaginatedResponse(expenses, total, page, limit) });
});

// POST /api/accounts/incomes
const createIncome = asyncHandler(async (req, res) => {
  const data = entrySchema.parse(req.body);
  const income = await prisma.income.create({
    data: { ...data, recordedById: req.user.id },
  });
  res.status(201).json({ success: true, data: income, message: "Income recorded" });
});

// GET /api/accounts/incomes
const getIncomes = asyncHandler(async (req, res) => {
  const { page, limit, skip, take } = getPagination(req.query);
  const [incomes, total] = await Promise.all([
    prisma.income.findMany({ skip, take, orderBy: { date: "desc" } }),
    prisma.income.count(),
  ]);
  res.json({ success: true, ...buildPaginatedResponse(incomes, total, page, limit) });
});

// GET /api/accounts/summary
const getSummary = asyncHandler(async (req, res) => {
  const [incomeAgg, expenseAgg, salaryAgg] = await Promise.all([
    prisma.income.aggregate({ _sum: { amount: true } }),
    prisma.expense.aggregate({ _sum: { amount: true } }),
    prisma.faculty.aggregate({ _sum: { salary: true }, where: { isActive: true } }),
  ]);

  const totalIncome = Number(incomeAgg._sum.amount || 0);
  const totalExpense = Number(expenseAgg._sum.amount || 0);
  const totalSalary = Number(salaryAgg._sum.salary || 0);

  res.json({
    success: true,
    data: {
      totalIncome,
      totalExpense,
      totalSalary,
      netBalance: totalIncome - totalExpense - totalSalary,
    },
  });
});

module.exports = { createExpense, getExpenses, createIncome, getIncomes, getSummary };
