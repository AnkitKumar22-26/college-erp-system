// server/src/controllers/fee.controller.js
const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { getPagination, buildPaginatedResponse } = require("../utils/pagination");
const { exportToExcel } = require("../utils/excel");
const { generateFeeReceiptPdf } = require("../utils/pdf");

function generateReceiptNo() {
  const ts = Date.now().toString().slice(-8);
  const rand = Math.floor(100 + Math.random() * 900);
  return `RCPT-${ts}${rand}`;
}

function computeStatus(totalAmount, discount, scholarship, fine, paidAmount) {
  const payable = Number(totalAmount) - Number(discount) - Number(scholarship) + Number(fine);
  if (paidAmount <= 0) return "PENDING";
  if (paidAmount >= payable) return "PAID";
  return "PARTIAL";
}

// ---------- Fee Structures ----------

// POST /api/fees/structures
const createFeeStructure = asyncHandler(async (req, res) => {
  const structure = await prisma.feeStructure.create({ data: req.body });
  res.status(201).json({ success: true, data: structure, message: "Fee structure created" });
});

// GET /api/fees/structures
const getFeeStructures = asyncHandler(async (req, res) => {
  const structures = await prisma.feeStructure.findMany({ orderBy: { createdAt: "desc" } });
  res.json({ success: true, data: structures });
});

// ---------- Assign fee to student ----------

// POST /api/fees/assign
const assignFee = asyncHandler(async (req, res) => {
  const { studentId, feeStructureId, discount, scholarship, fine, dueDate } = req.body;

  const [student, structure] = await Promise.all([
    prisma.student.findUnique({ where: { id: studentId } }),
    prisma.feeStructure.findUnique({ where: { id: feeStructureId } }),
  ]);
  if (!student) throw new ApiError(422, "Student does not exist");
  if (!structure) throw new ApiError(422, "Fee structure does not exist");

  const totalAmount =
    Number(structure.tuitionFee) +
    Number(structure.hostelFee) +
    Number(structure.transportFee) +
    Number(structure.otherFee);

  const studentFee = await prisma.studentFee.create({
    data: {
      studentId,
      feeStructureId,
      totalAmount,
      discount,
      scholarship,
      fine,
      dueDate,
      status: computeStatus(totalAmount, discount, scholarship, fine, 0),
    },
    include: { feeStructure: true },
  });

  res.status(201).json({ success: true, data: studentFee, message: "Fee assigned to student" });
});

// GET /api/fees/student/:studentId
const getStudentFees = asyncHandler(async (req, res) => {
  const fees = await prisma.studentFee.findMany({
    where: { studentId: req.params.studentId },
    include: { feeStructure: true, payments: { orderBy: { paidAt: "desc" } } },
    orderBy: { createdAt: "desc" },
  });
  res.json({ success: true, data: fees });
});

// GET /api/fees/pending  (search + filter + pagination)
const getPendingFees = asyncHandler(async (req, res) => {
  const { page, limit, skip, take } = getPagination(req.query);
  const { departmentId, search, status } = req.query;

  const where = {
    status: status || { in: ["PENDING", "PARTIAL", "OVERDUE"] },
  };
  if (departmentId) where.student = { departmentId };
  if (search) {
    where.student = {
      ...(where.student || {}),
      OR: [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { admissionNo: { contains: search, mode: "insensitive" } },
      ],
    };
  }

  const [fees, total] = await Promise.all([
    prisma.studentFee.findMany({
      where,
      include: {
        student: { select: { firstName: true, lastName: true, admissionNo: true, rollNo: true } },
        feeStructure: true,
      },
      skip,
      take,
      orderBy: { dueDate: "asc" },
    }),
    prisma.studentFee.count({ where }),
  ]);

  res.json({ success: true, ...buildPaginatedResponse(fees, total, page, limit) });
});

// ---------- Collect Payment ----------

// POST /api/fees/collect
const collectFee = asyncHandler(async (req, res) => {
  const { studentFeeId, amount, mode, remarks } = req.body;

  const studentFee = await prisma.studentFee.findUnique({ where: { id: studentFeeId } });
  if (!studentFee) throw new ApiError(404, "Student fee record not found");

  const newPaidAmount = Number(studentFee.paidAmount) + Number(amount);
  const newStatus = computeStatus(
    studentFee.totalAmount,
    studentFee.discount,
    studentFee.scholarship,
    studentFee.fine,
    newPaidAmount
  );

  const [payment] = await prisma.$transaction([
    prisma.feePayment.create({
      data: {
        studentFeeId,
        studentId: studentFee.studentId,
        amount,
        mode,
        remarks,
        receiptNo: generateReceiptNo(),
      },
    }),
    prisma.studentFee.update({
      where: { id: studentFeeId },
      data: { paidAmount: newPaidAmount, status: newStatus },
    }),
  ]);

  res.status(201).json({ success: true, data: payment, message: "Payment collected successfully" });
});

// GET /api/fees/receipt/:paymentId  -> streams a PDF
const downloadReceipt = asyncHandler(async (req, res) => {
  const payment = await prisma.feePayment.findUnique({
    where: { id: req.params.paymentId },
    include: { student: { select: { firstName: true, lastName: true, admissionNo: true } } },
  });
  if (!payment) throw new ApiError(404, "Payment record not found");

  generateFeeReceiptPdf(res, payment);
});

// GET /api/fees/export/excel
const exportFeesExcel = asyncHandler(async (req, res) => {
  const { departmentId, status } = req.query;
  const where = {};
  if (departmentId) where.student = { departmentId };
  if (status) where.status = status;

  const fees = await prisma.studentFee.findMany({
    where,
    include: {
      student: { select: { firstName: true, lastName: true, admissionNo: true } },
      feeStructure: true,
    },
    orderBy: { dueDate: "asc" },
  });

  await exportToExcel(res, {
    sheetName: "Fees",
    filename: "fees-report.xlsx",
    columns: [
      { header: "Admission No", key: "admissionNo", width: 16 },
      { header: "Student Name", key: "name", width: 22 },
      { header: "Fee Structure", key: "structure", width: 20 },
      { header: "Total Amount", key: "total", width: 14 },
      { header: "Paid Amount", key: "paid", width: 14 },
      { header: "Balance", key: "balance", width: 14 },
      { header: "Due Date", key: "dueDate", width: 14 },
      { header: "Status", key: "status", width: 12 },
    ],
    rows: fees.map((f) => {
      const payable =
        Number(f.totalAmount) - Number(f.discount) - Number(f.scholarship) + Number(f.fine);
      return {
        admissionNo: f.student.admissionNo,
        name: `${f.student.firstName} ${f.student.lastName}`,
        structure: f.feeStructure.name,
        total: payable,
        paid: Number(f.paidAmount),
        balance: Math.max(payable - Number(f.paidAmount), 0),
        dueDate: new Date(f.dueDate).toLocaleDateString("en-IN"),
        status: f.status,
      };
    }),
  });
});

module.exports = {
  createFeeStructure,
  getFeeStructures,
  assignFee,
  getStudentFees,
  getPendingFees,
  collectFee,
  downloadReceipt,
  exportFeesExcel,
};
