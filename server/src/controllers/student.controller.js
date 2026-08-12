// server/src/controllers/student.controller.js
const bcrypt = require("bcryptjs");
const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { getPagination, buildPaginatedResponse } = require("../utils/pagination");
const { exportToExcel } = require("../utils/excel");

const studentSelect = {
  id: true,
  admissionNo: true,
  rollNo: true,
  firstName: true,
  lastName: true,
  gender: true,
  dob: true,
  photoUrl: true,
  phone: true,
  email: true,
  address: true,
  city: true,
  state: true,
  pincode: true,
  departmentId: true,
  semester: true,
  section: true,
  academicYear: true,
  status: true,
  guardianName: true,
  guardianPhone: true,
  guardianEmail: true,
  guardianRelation: true,
  createdAt: true,
  updatedAt: true,
  department: { select: { id: true, name: true, code: true } },
};

// Build a Prisma `where` clause from query params (search + filters)
function buildWhere(query) {
  const where = {};

  if (query.search) {
    where.OR = [
      { firstName: { contains: query.search, mode: "insensitive" } },
      { lastName: { contains: query.search, mode: "insensitive" } },
      { admissionNo: { contains: query.search, mode: "insensitive" } },
      { rollNo: { contains: query.search, mode: "insensitive" } },
      { email: { contains: query.search, mode: "insensitive" } },
    ];
  }

  if (query.departmentId) where.departmentId = query.departmentId;
  if (query.semester) where.semester = parseInt(query.semester, 10);
  if (query.section) where.section = query.section;
  if (query.status) where.status = query.status;
  if (query.academicYear) where.academicYear = query.academicYear;
  if (query.gender) where.gender = query.gender;

  return where;
}

// GET /api/students
const getStudents = asyncHandler(async (req, res) => {
  const { page, limit, skip, take } = getPagination(req.query);
  const where = buildWhere(req.query);

  const sortField = ["firstName", "rollNo", "admissionNo", "createdAt", "semester"].includes(
    req.query.sortBy
  )
    ? req.query.sortBy
    : "createdAt";
  const sortOrder = req.query.sortOrder === "asc" ? "asc" : "desc";

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      select: studentSelect,
      skip,
      take,
      orderBy: { [sortField]: sortOrder },
    }),
    prisma.student.count({ where }),
  ]);

  res.json({ success: true, ...buildPaginatedResponse(students, total, page, limit) });
});

// GET /api/students/:id
const getStudentById = asyncHandler(async (req, res) => {
  const student = await prisma.student.findUnique({
    where: { id: req.params.id },
    select: {
      ...studentSelect,
      documents: true,
      attendances: { orderBy: { date: "desc" }, take: 30 },
      studentFees: {
        include: { feeStructure: true, payments: { orderBy: { paidAt: "desc" } } },
      },
    },
  });

  if (!student) throw new ApiError(404, "Student not found");
  res.json({ success: true, data: student });
});

// POST /api/students
const createStudent = asyncHandler(async (req, res) => {
  const data = req.body;

  const department = await prisma.department.findUnique({ where: { id: data.departmentId } });
  if (!department) throw new ApiError(422, "Selected department does not exist");

  const photoUrl = req.file ? `/uploads/students/${req.file.filename}` : null;

  const created = await prisma.$transaction(async (tx) => {
    const defaultPassword = data.admissionNo;
    const hashed = await bcrypt.hash(defaultPassword, 10);

    const user = await tx.user.create({
      data: { email: data.email, password: hashed, role: "STUDENT" },
    });

    const student = await tx.student.create({
      data: {
        userId: user.id,
        admissionNo: data.admissionNo,
        rollNo: data.rollNo,
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender,
        dob: data.dob,
        photoUrl,
        phone: data.phone,
        email: data.email,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        departmentId: data.departmentId,
        semester: data.semester,
        section: data.section,
        academicYear: data.academicYear,
        guardianName: data.guardianName,
        guardianPhone: data.guardianPhone,
        guardianEmail: data.guardianEmail || null,
        guardianRelation: data.guardianRelation,
      },
      select: studentSelect,
    });

    return student;
  });

  res.status(201).json({ success: true, data: created, message: "Student created successfully" });
});

// PUT /api/students/:id
const updateStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  const existing = await prisma.student.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Student not found");

  if (req.file) {
    data.photoUrl = `/uploads/students/${req.file.filename}`;
  }
  if (data.guardianEmail === "") data.guardianEmail = null;

  const updated = await prisma.student.update({
    where: { id },
    data,
    select: studentSelect,
  });

  res.json({ success: true, data: updated, message: "Student updated successfully" });
});

// DELETE /api/students/:id
const deleteStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existing = await prisma.student.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Student not found");

  await prisma.$transaction(async (tx) => {
    await tx.student.delete({ where: { id } });
    if (existing.userId) {
      await tx.user.delete({ where: { id: existing.userId } }).catch(() => {});
    }
  });

  res.json({ success: true, message: "Student deleted successfully" });
});

// POST /api/students/promote
const promoteStudents = asyncHandler(async (req, res) => {
  const { studentIds, toSemester } = req.body;

  const result = await prisma.student.updateMany({
    where: { id: { in: studentIds } },
    data: { semester: toSemester, status: "PROMOTED" },
  });

  res.json({
    success: true,
    message: `${result.count} student(s) promoted to semester ${toSemester}`,
  });
});

// PATCH /api/students/:id/transfer
const transferStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  const existing = await prisma.student.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Student not found");

  if (data.departmentId) {
    const dept = await prisma.department.findUnique({ where: { id: data.departmentId } });
    if (!dept) throw new ApiError(422, "Selected department does not exist");
  }

  const updated = await prisma.student.update({
    where: { id },
    data: {
      departmentId: data.departmentId || existing.departmentId,
      section: data.section || existing.section,
      status: data.status || "TRANSFERRED",
    },
    select: studentSelect,
  });

  res.json({ success: true, data: updated, message: "Student transferred successfully" });
});

// GET /api/students/export/excel
const exportStudentsExcel = asyncHandler(async (req, res) => {
  const where = buildWhere(req.query);
  const students = await prisma.student.findMany({
    where,
    select: studentSelect,
    orderBy: { createdAt: "desc" },
  });

  await exportToExcel(res, {
    sheetName: "Students",
    filename: "students.xlsx",
    columns: [
      { header: "Admission No", key: "admissionNo", width: 16 },
      { header: "Roll No", key: "rollNo", width: 12 },
      { header: "First Name", key: "firstName", width: 16 },
      { header: "Last Name", key: "lastName", width: 16 },
      { header: "Department", key: "department", width: 18 },
      { header: "Semester", key: "semester", width: 10 },
      { header: "Section", key: "section", width: 10 },
      { header: "Phone", key: "phone", width: 16 },
      { header: "Email", key: "email", width: 26 },
      { header: "Status", key: "status", width: 14 },
    ],
    rows: students.map((s) => ({
      admissionNo: s.admissionNo,
      rollNo: s.rollNo,
      firstName: s.firstName,
      lastName: s.lastName,
      department: s.department?.name,
      semester: s.semester,
      section: s.section,
      phone: s.phone,
      email: s.email,
      status: s.status,
    })),
  });
});

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  promoteStudents,
  transferStudent,
  exportStudentsExcel,
};
