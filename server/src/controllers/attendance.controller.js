// server/src/controllers/attendance.controller.js
const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { getPagination, buildPaginatedResponse } = require("../utils/pagination");
const { exportToExcel } = require("../utils/excel");

function normalizeDate(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

// POST /api/attendance/students/mark
const markStudentAttendance = asyncHandler(async (req, res) => {
  const { date, records } = req.body;
  const day = normalizeDate(date);

  const results = await prisma.$transaction(
    records.map((r) =>
      prisma.attendance.upsert({
        where: { studentId_date: { studentId: r.studentId, date: day } },
        update: { status: r.status, remarks: r.remarks, markedBy: req.user.id },
        create: {
          studentId: r.studentId,
          date: day,
          status: r.status,
          remarks: r.remarks,
          markedBy: req.user.id,
        },
      })
    )
  );

  res.json({
    success: true,
    message: `Attendance marked for ${results.length} student(s)`,
    data: results,
  });
});

// GET /api/attendance/students?date=&departmentId=&semester=&section=
const getStudentAttendanceByDate = asyncHandler(async (req, res) => {
  const { date, departmentId, semester, section } = req.query;
  if (!date) throw new ApiError(400, "date query parameter is required");

  const day = normalizeDate(date);

  const studentWhere = {};
  if (departmentId) studentWhere.departmentId = departmentId;
  if (semester) studentWhere.semester = parseInt(semester, 10);
  if (section) studentWhere.section = section;

  const students = await prisma.student.findMany({
    where: { status: "ACTIVE", ...studentWhere },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      rollNo: true,
      admissionNo: true,
      department: { select: { name: true } },
      attendances: { where: { date: day }, select: { status: true, remarks: true } },
    },
    orderBy: { rollNo: "asc" },
  });

  const data = students.map((s) => ({
    studentId: s.id,
    firstName: s.firstName,
    lastName: s.lastName,
    rollNo: s.rollNo,
    admissionNo: s.admissionNo,
    department: s.department?.name,
    status: s.attendances[0]?.status || null,
    remarks: s.attendances[0]?.remarks || null,
  }));

  res.json({ success: true, data });
});

// GET /api/attendance/students/report
const getStudentAttendanceReport = asyncHandler(async (req, res) => {
  const { page, limit, skip, take } = getPagination(req.query);
  const { studentId, departmentId, month, year, from, to } = req.query;

  const where = {};
  if (studentId) where.studentId = studentId;
  if (departmentId) where.student = { departmentId };

  if (month && year) {
    const start = new Date(Number(year), Number(month) - 1, 1);
    const end = new Date(Number(year), Number(month), 0, 23, 59, 59);
    where.date = { gte: start, lte: end };
  } else if (from && to) {
    where.date = { gte: new Date(from), lte: new Date(to) };
  }

  const [records, total] = await Promise.all([
    prisma.attendance.findMany({
      where,
      include: {
        student: {
          select: { firstName: true, lastName: true, rollNo: true, admissionNo: true },
        },
      },
      skip,
      take,
      orderBy: { date: "desc" },
    }),
    prisma.attendance.count({ where }),
  ]);

  res.json({ success: true, ...buildPaginatedResponse(records, total, page, limit) });
});

// GET /api/attendance/students/export/excel
const exportStudentAttendanceExcel = asyncHandler(async (req, res) => {
  const { studentId, departmentId, month, year } = req.query;

  const where = {};
  if (studentId) where.studentId = studentId;
  if (departmentId) where.student = { departmentId };
  if (month && year) {
    const start = new Date(Number(year), Number(month) - 1, 1);
    const end = new Date(Number(year), Number(month), 0, 23, 59, 59);
    where.date = { gte: start, lte: end };
  }

  const records = await prisma.attendance.findMany({
    where,
    include: { student: { select: { firstName: true, lastName: true, rollNo: true, admissionNo: true } } },
    orderBy: { date: "desc" },
  });

  await exportToExcel(res, {
    sheetName: "Attendance",
    filename: "attendance-report.xlsx",
    columns: [
      { header: "Date", key: "date", width: 14 },
      { header: "Admission No", key: "admissionNo", width: 16 },
      { header: "Roll No", key: "rollNo", width: 12 },
      { header: "Name", key: "name", width: 22 },
      { header: "Status", key: "status", width: 14 },
      { header: "Remarks", key: "remarks", width: 20 },
    ],
    rows: records.map((r) => ({
      date: new Date(r.date).toLocaleDateString("en-IN"),
      admissionNo: r.student.admissionNo,
      rollNo: r.student.rollNo,
      name: `${r.student.firstName} ${r.student.lastName}`,
      status: r.status,
      remarks: r.remarks || "",
    })),
  });
});

// POST /api/attendance/faculty/mark
const markFacultyAttendance = asyncHandler(async (req, res) => {
  const { date, records } = req.body;
  const day = normalizeDate(date);

  const results = await prisma.$transaction(
    records.map((r) =>
      prisma.facultyAttendance.upsert({
        where: { facultyId_date: { facultyId: r.facultyId, date: day } },
        update: { status: r.status, remarks: r.remarks },
        create: { facultyId: r.facultyId, date: day, status: r.status, remarks: r.remarks },
      })
    )
  );

  res.json({
    success: true,
    message: `Attendance marked for ${results.length} faculty member(s)`,
    data: results,
  });
});

// GET /api/attendance/faculty?date=
const getFacultyAttendanceByDate = asyncHandler(async (req, res) => {
  const { date, departmentId } = req.query;
  if (!date) throw new ApiError(400, "date query parameter is required");
  const day = normalizeDate(date);

  const facultyWhere = { isActive: true };
  if (departmentId) facultyWhere.departmentId = departmentId;

  const faculty = await prisma.faculty.findMany({
    where: facultyWhere,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      employeeCode: true,
      department: { select: { name: true } },
      attendances: { where: { date: day }, select: { status: true, remarks: true } },
    },
    orderBy: { firstName: "asc" },
  });

  const data = faculty.map((f) => ({
    facultyId: f.id,
    firstName: f.firstName,
    lastName: f.lastName,
    employeeCode: f.employeeCode,
    department: f.department?.name,
    status: f.attendances[0]?.status || null,
    remarks: f.attendances[0]?.remarks || null,
  }));

  res.json({ success: true, data });
});
// GET /api/attendance/my-attendance (For logged-in student)
const getMyAttendance = asyncHandler(async (req, res) => {
  // लॉगिन यूजर की आईडी से स्टूडेंट प्रोफाइल खोजें
  const student = await prisma.student.findUnique({
    where: { userId: req.user.id }
  });

  if (!student) {
    throw new ApiError(404, "Student profile not found for this user");
  }

  // इस स्टूडेंट के सभी अटेंडेंस रिकॉर्ड लाएं
  const records = await prisma.attendance.findMany({
    where: { studentId: student.id },
    orderBy: { date: 'desc' }
  });

  let totalClasses = records.length;
  let presentCount = 0;

  records.forEach(record => {
    if (record.status === 'PRESENT' || record.status === 'LATE' || record.status === 'HALF_DAY') {
      presentCount += 1;
    }
  });

  const overallPercentage = totalClasses > 0 ? ((presentCount / totalClasses) * 100).toFixed(1) : 0;

  res.json({
    success: true,
    overallPercentage: parseFloat(overallPercentage),
    totalClasses,
    presentCount,
    recentHistory: records.map(r => ({
      date: new Date(r.date).toISOString().split('T')[0],
      status: r.status,
      remarks: r.remarks
    }))
  });
});

module.exports = {
  markStudentAttendance,
  getStudentAttendanceByDate,
  getStudentAttendanceReport,
  exportStudentAttendanceExcel,
  markFacultyAttendance,
  getFacultyAttendanceByDate,
  getMyAttendance, // <--- इसे यहाँ जोड़ दें
};