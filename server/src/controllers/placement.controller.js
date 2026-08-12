// server/src/controllers/placement.controller.js
const { z } = require("zod");
const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

// POST /api/placements/companies
const createCompany = asyncHandler(async (req, res) => {
  const schema = z.object({ name: z.string().min(1) });
  const data = schema.parse(req.body);
  const company = await prisma.company.create({ data });
  res.status(201).json({ success: true, data: company, message: "Company added" });
});

// GET /api/placements/companies
const getCompanies = asyncHandler(async (req, res) => {
  const companies = await prisma.company.findMany({ include: { drives: true } });
  res.json({ success: true, data: companies });
});

// POST /api/placements/drives
const createDrive = asyncHandler(async (req, res) => {
  const schema = z.object({
    companyId: z.string().uuid(),
    driveDate: z.coerce.date(),
    role: z.string().min(1),
    packageLPA: z.coerce.number().min(0),
  });
  const data = schema.parse(req.body);
  const drive = await prisma.placementDrive.create({ data });
  res.status(201).json({ success: true, data: drive, message: "Placement drive scheduled" });
});

// GET /api/placements/drives
const getDrives = asyncHandler(async (req, res) => {
  const drives = await prisma.placementDrive.findMany({
    include: { company: true, selections: { include: { student: true } } },
    orderBy: { driveDate: "desc" },
  });
  res.json({ success: true, data: drives });
});

// POST /api/placements/drives/:id/select
const selectStudent = asyncHandler(async (req, res) => {
  const schema = z.object({ studentId: z.string().uuid() });
  const { studentId } = schema.parse(req.body);

  const drive = await prisma.placementDrive.findUnique({ where: { id: req.params.id } });
  if (!drive) throw new ApiError(404, "Placement drive not found");

  const selection = await prisma.placementSelection.create({
    data: { driveId: req.params.id, studentId },
  });
  res.status(201).json({ success: true, data: selection, message: "Student marked as selected" });
});

// GET /api/placements/selected
const getSelectedStudents = asyncHandler(async (req, res) => {
  const selections = await prisma.placementSelection.findMany({
    include: {
      student: { select: { firstName: true, lastName: true, admissionNo: true } },
      drive: { include: { company: true } },
    },
    orderBy: { selectedAt: "desc" },
  });
  res.json({ success: true, data: selections });
});

module.exports = { createCompany, getCompanies, createDrive, getDrives, selectStudent, getSelectedStudents };
