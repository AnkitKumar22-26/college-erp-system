// server/src/controllers/department.controller.js
const { z } = require("zod");
const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const departmentSchema = z.object({
  name: z.string().min(1, "Department name is required"),
  code: z.string().min(1, "Department code is required"),
  description: z.string().optional(),
  hodId: z.string().uuid().optional().nullable(),
});

// GET /api/departments
const getDepartments = asyncHandler(async (req, res) => {
  const departments = await prisma.department.findMany({
    include: {
      hod: { select: { id: true, firstName: true, lastName: true } },
      _count: { select: { students: true, faculty: true, subjects: true } },
    },
    orderBy: { name: "asc" },
  });
  res.json({ success: true, data: departments });
});

// GET /api/departments/:id
const getDepartmentById = asyncHandler(async (req, res) => {
  const department = await prisma.department.findUnique({
    where: { id: req.params.id },
    include: {
      hod: { select: { id: true, firstName: true, lastName: true } },
      faculty: { select: { id: true, firstName: true, lastName: true, designation: true } },
      subjects: true,
      _count: { select: { students: true, faculty: true } },
    },
  });
  if (!department) throw new ApiError(404, "Department not found");
  res.json({ success: true, data: department });
});

// POST /api/departments
const createDepartment = asyncHandler(async (req, res) => {
  const data = departmentSchema.parse(req.body);
  const department = await prisma.department.create({ data });
  res.status(201).json({ success: true, data: department, message: "Department created" });
});

// PUT /api/departments/:id
const updateDepartment = asyncHandler(async (req, res) => {
  const data = departmentSchema.partial().parse(req.body);
  const existing = await prisma.department.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new ApiError(404, "Department not found");

  const department = await prisma.department.update({ where: { id: req.params.id }, data });
  res.json({ success: true, data: department, message: "Department updated" });
});

// DELETE /api/departments/:id
const deleteDepartment = asyncHandler(async (req, res) => {
  const existing = await prisma.department.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new ApiError(404, "Department not found");

  await prisma.department.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: "Department deleted" });
});

// POST /api/departments/:id/assign-hod  { facultyId }
const assignHod = asyncHandler(async (req, res) => {
  const { facultyId } = req.body;
  if (!facultyId) throw new ApiError(400, "facultyId is required");

  const faculty = await prisma.faculty.findUnique({ where: { id: facultyId } });
  if (!faculty) throw new ApiError(422, "Faculty does not exist");

  const department = await prisma.department.update({
    where: { id: req.params.id },
    data: { hodId: facultyId },
  });

  await prisma.user.updateMany({
    where: { faculty: { id: facultyId } },
    data: { role: "HOD" },
  });

  res.json({ success: true, data: department, message: "HOD assigned successfully" });
});

// GET /api/departments/:id/subjects
const getDepartmentSubjects = asyncHandler(async (req, res) => {
  const subjects = await prisma.subject.findMany({
    where: { departmentId: req.params.id },
    orderBy: [{ semester: "asc" }, { name: "asc" }],
  });
  res.json({ success: true, data: subjects });
});

// POST /api/departments/:id/subjects
const createSubject = asyncHandler(async (req, res) => {
  const schema = z.object({
    name: z.string().min(1),
    code: z.string().min(1),
    semester: z.coerce.number().int().min(1).max(12),
    credits: z.coerce.number().int().min(1).max(10).default(3),
  });
  const data = schema.parse(req.body);

  const subject = await prisma.subject.create({
    data: { ...data, departmentId: req.params.id },
  });
  res.status(201).json({ success: true, data: subject, message: "Subject created" });
});

module.exports = {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  assignHod,
  getDepartmentSubjects,
  createSubject,
};
