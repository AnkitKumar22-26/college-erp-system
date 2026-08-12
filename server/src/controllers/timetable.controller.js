// server/src/controllers/timetable.controller.js
const { z } = require("zod");
const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const timetableSchema = z.object({
  departmentId: z.string().uuid(),
  semester: z.coerce.number().int().min(1).max(12),
  section: z.string().min(1),
  academicYear: z.string().min(4),
});

const slotSchema = z.object({
  subjectId: z.string().uuid(),
  facultyId: z.string().uuid(),
  dayOfWeek: z.coerce.number().int().min(0).max(6),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  room: z.string().optional(),
});

// POST /api/timetable
const createTimetable = asyncHandler(async (req, res) => {
  const data = timetableSchema.parse(req.body);
  const timetable = await prisma.timetable.create({ data });
  res.status(201).json({ success: true, data: timetable, message: "Timetable created" });
});

// GET /api/timetable?departmentId=&semester=&section=
const getTimetables = asyncHandler(async (req, res) => {
  const { departmentId, semester, section } = req.query;
  const where = {};
  if (departmentId) where.departmentId = departmentId;
  if (semester) where.semester = parseInt(semester, 10);
  if (section) where.section = section;

  const timetables = await prisma.timetable.findMany({
    where,
    include: {
      slots: { include: { subject: true, faculty: { select: { firstName: true, lastName: true } } } },
      department: { select: { name: true } },
    },
  });
  res.json({ success: true, data: timetables });
});

// POST /api/timetable/:id/slots
const addSlot = asyncHandler(async (req, res) => {
  const data = slotSchema.parse(req.body);
  const timetable = await prisma.timetable.findUnique({ where: { id: req.params.id } });
  if (!timetable) throw new ApiError(404, "Timetable not found");

  const slot = await prisma.timetableSlot.create({ data: { ...data, timetableId: req.params.id } });
  res.status(201).json({ success: true, data: slot, message: "Slot added" });
});

// GET /api/timetable/faculty/:facultyId
const getFacultyTimetable = asyncHandler(async (req, res) => {
  const slots = await prisma.timetableSlot.findMany({
    where: { facultyId: req.params.facultyId },
    include: { subject: true, timetable: { include: { department: true } } },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });
  res.json({ success: true, data: slots });
});

module.exports = { createTimetable, getTimetables, addSlot, getFacultyTimetable };
