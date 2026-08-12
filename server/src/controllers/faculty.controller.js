// server/src/controllers/faculty.controller.js
const bcrypt = require("bcryptjs");
const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { getPagination, buildPaginatedResponse } = require("../utils/pagination");
const { exportToExcel } = require("../utils/excel");

const facultySelect = {
  id: true,
  employeeCode: true,
  firstName: true,
  lastName: true,
  gender: true,
  dob: true,
  photoUrl: true,
  phone: true,
  email: true,
  address: true,
  departmentId: true,
  designation: true,
  qualification: true,
  experienceYrs: true,
  salary: true,
  joiningDate: true,
  isActive: true,
  createdAt: true,
  department: { select: { id: true, name: true, code: true } },
  facultySubjects: { include: { subject: { select: { id: true, name: true, code: true } } } },
};

function buildWhere(query) {
  const where = {};

  if (query.search) {
    where.OR = [
      { firstName: { contains: query.search, mode: "insensitive" } },
      { lastName: { contains: query.search, mode: "insensitive" } },
      { employeeCode: { contains: query.search, mode: "insensitive" } },
      { email: { contains: query.search, mode: "insensitive" } },
      { designation: { contains: query.search, mode: "insensitive" } },
    ];
  }

  if (query.departmentId) where.departmentId = query.departmentId;
  if (query.designation) where.designation = query.designation;
  if (query.isActive !== undefined) where.isActive = query.isActive === "true";

  return where;
}

// GET /api/faculty
const getFacultyList = asyncHandler(async (req, res) => {
  const { page, limit, skip, take } = getPagination(req.query);
  const where = buildWhere(req.query);

  const sortField = ["firstName", "employeeCode", "createdAt", "salary"].includes(req.query.sortBy)
    ? req.query.sortBy
    : "createdAt";
  const sortOrder = req.query.sortOrder === "asc" ? "asc" : "desc";

  const [faculty, total] = await Promise.all([
    prisma.faculty.findMany({
      where,
      select: facultySelect,
      skip,
      take,
      orderBy: { [sortField]: sortOrder },
    }),
    prisma.faculty.count({ where }),
  ]);

  res.json({ success: true, ...buildPaginatedResponse(faculty, total, page, limit) });
});

// GET /api/faculty/:id
const getFacultyById = asyncHandler(async (req, res) => {
  const faculty = await prisma.faculty.findUnique({
    where: { id: req.params.id },
    select: {
      ...facultySelect,
      attendances: { orderBy: { date: "desc" }, take: 30 },
      leaves: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });

  if (!faculty) throw new ApiError(404, "Faculty not found");
  res.json({ success: true, data: faculty });
});

// POST /api/faculty
const createFaculty = asyncHandler(async (req, res) => {
  const data = req.body;

  const department = await prisma.department.findUnique({ where: { id: data.departmentId } });
  if (!department) throw new ApiError(422, "Selected department does not exist");

  const photoUrl = req.file ? `/uploads/faculty/${req.file.filename}` : null;
  const subjectIds = data.subjectIds || [];

  const created = await prisma.$transaction(async (tx) => {
    const defaultPassword = data.employeeCode;
    const hashed = await bcrypt.hash(defaultPassword, 10);

    const user = await tx.user.create({
      data: { email: data.email, password: hashed, role: "FACULTY" },
    });

    const faculty = await tx.faculty.create({
      data: {
        userId: user.id,
        employeeCode: data.employeeCode,
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender,
        dob: data.dob,
        photoUrl,
        phone: data.phone,
        email: data.email,
        address: data.address,
        departmentId: data.departmentId,
        designation: data.designation,
        qualification: data.qualification,
        experienceYrs: data.experienceYrs,
        salary: data.salary,
        joiningDate: data.joiningDate || new Date(),
        facultySubjects: subjectIds.length
          ? { create: subjectIds.map((subjectId) => ({ subjectId })) }
          : undefined,
      },
      select: facultySelect,
    });

    return faculty;
  });

  res.status(201).json({ success: true, data: created, message: "Faculty created successfully" });
});

// PUT /api/faculty/:id
const updateFaculty = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  const existing = await prisma.faculty.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Faculty not found");

  if (req.file) data.photoUrl = `/uploads/faculty/${req.file.filename}`;
  const { subjectIds, ...rest } = data;

  const updated = await prisma.$transaction(async (tx) => {
    if (subjectIds) {
      await tx.facultySubject.deleteMany({ where: { facultyId: id } });
      if (subjectIds.length) {
        await tx.facultySubject.createMany({
          data: subjectIds.map((subjectId) => ({ facultyId: id, subjectId })),
        });
      }
    }

    return tx.faculty.update({ where: { id }, data: rest, select: facultySelect });
  });

  res.json({ success: true, data: updated, message: "Faculty updated successfully" });
});

// DELETE /api/faculty/:id
const deleteFaculty = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existing = await prisma.faculty.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Faculty not found");

  await prisma.$transaction(async (tx) => {
    await tx.faculty.update({ where: { id }, data: { isActive: false } });
  });

  res.json({ success: true, message: "Faculty deactivated successfully" });
});

// GET /api/faculty/export/excel
const exportFacultyExcel = asyncHandler(async (req, res) => {
  const where = buildWhere(req.query);
  const faculty = await prisma.faculty.findMany({
    where,
    select: facultySelect,
    orderBy: { createdAt: "desc" },
  });

  await exportToExcel(res, {
    sheetName: "Faculty",
    filename: "faculty.xlsx",
    columns: [
      { header: "Employee Code", key: "employeeCode", width: 16 },
      { header: "First Name", key: "firstName", width: 16 },
      { header: "Last Name", key: "lastName", width: 16 },
      { header: "Department", key: "department", width: 18 },
      { header: "Designation", key: "designation", width: 18 },
      { header: "Qualification", key: "qualification", width: 18 },
      { header: "Experience (yrs)", key: "experienceYrs", width: 16 },
      { header: "Salary", key: "salary", width: 14 },
      { header: "Phone", key: "phone", width: 16 },
      { header: "Email", key: "email", width: 26 },
      { header: "Active", key: "isActive", width: 10 },
    ],
    rows: faculty.map((f) => ({
      employeeCode: f.employeeCode,
      firstName: f.firstName,
      lastName: f.lastName,
      department: f.department?.name,
      designation: f.designation,
      qualification: f.qualification,
      experienceYrs: f.experienceYrs,
      salary: Number(f.salary),
      phone: f.phone,
      email: f.email,
      isActive: f.isActive ? "Yes" : "No",
    })),
  });
});

module.exports = {
  getFacultyList,
  getFacultyById,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  exportFacultyExcel,
};
