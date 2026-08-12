// server/src/controllers/dashboard.controller.js
const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/dashboard/stats
const getStats = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalStudents,
    totalFaculty,
    totalDepartments,
    todayPresent,
    todayTotalMarked,
    feesAgg,
    booksIssued,
    totalPlacements,
  ] = await Promise.all([
    prisma.student.count({ where: { status: "ACTIVE" } }),
    prisma.faculty.count({ where: { isActive: true } }),
    prisma.department.count(),
    prisma.attendance.count({ where: { date: today, status: "PRESENT" } }),
    prisma.attendance.count({ where: { date: today } }),
    prisma.studentFee.aggregate({
      _sum: { totalAmount: true, paidAmount: true },
    }),
    prisma.bookIssue.count({ where: { status: "ISSUED" } }),
    prisma.placementSelection.count(),
  ]);

  const totalFees = Number(feesAgg._sum.totalAmount || 0);
  const collectedFees = Number(feesAgg._sum.paidAmount || 0);

  res.json({
    success: true,
    data: {
      totalStudents,
      totalFaculty,
      totalDepartments,
      todayAttendance: {
        present: todayPresent,
        marked: todayTotalMarked,
        percentage: todayTotalMarked ? Math.round((todayPresent / todayTotalMarked) * 100) : 0,
      },
      feesCollected: collectedFees,
      pendingFees: Math.max(totalFees - collectedFees, 0),
      booksIssued,
      placements: totalPlacements,
    },
  });
});

// GET /api/dashboard/charts/attendance  (last 7 days)
const getAttendanceChart = asyncHandler(async (req, res) => {
  const days = 7;
  const results = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - i);

    const [present, total] = await Promise.all([
      prisma.attendance.count({ where: { date, status: "PRESENT" } }),
      prisma.attendance.count({ where: { date } }),
    ]);

    results.push({
      date: date.toISOString().slice(0, 10),
      present,
      absent: Math.max(total - present, 0),
    });
  }

  res.json({ success: true, data: results });
});

// GET /api/dashboard/charts/fees (by month, current year)
const getFeeChart = asyncHandler(async (req, res) => {
  const year = new Date().getFullYear();
  const payments = await prisma.feePayment.findMany({
    where: {
      paidAt: {
        gte: new Date(`${year}-01-01`),
        lte: new Date(`${year}-12-31`),
      },
    },
    select: { amount: true, paidAt: true },
  });

  const months = Array.from({ length: 12 }, (_, i) => ({
    month: new Date(year, i, 1).toLocaleString("default", { month: "short" }),
    collected: 0,
  }));

  payments.forEach((p) => {
    const idx = new Date(p.paidAt).getMonth();
    months[idx].collected += Number(p.amount);
  });

  res.json({ success: true, data: months });
});

// GET /api/dashboard/charts/departments
const getDepartmentChart = asyncHandler(async (req, res) => {
  const departments = await prisma.department.findMany({
    select: {
      name: true,
      _count: { select: { students: true } },
    },
  });

  res.json({
    success: true,
    data: departments.map((d) => ({ name: d.name, students: d._count.students })),
  });
});

module.exports = { getStats, getAttendanceChart, getFeeChart, getDepartmentChart };
