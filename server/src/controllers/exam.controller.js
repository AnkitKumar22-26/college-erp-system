// server/src/controllers/exam.controller.js
const { z } = require("zod");
const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const PDFDocument = require("pdfkit");

const scheduleSchema = z.object({
  subjectId: z.string().min(1, "Subject ID is required"),
  examType: z.string().min(1, "Exam type is required"),
  examDate: z.coerce.date(),
  maxMarks: z.coerce.number().int().min(1).default(100),
});

const resultSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  marksObtained: z.coerce.number().min(0),
  grade: z.string().optional(),
  sgpa: z.coerce.number().optional(),
  cgpa: z.coerce.number().optional(),
});

// POST /api/exams/schedules
const createSchedule = asyncHandler(async (req, res) => {
  const data = scheduleSchema.parse(req.body);
  const schedule = await prisma.examSchedule.create({ data });
  res.status(201).json({ success: true, data: schedule, message: "Exam scheduled" });
});

// GET /api/exams/schedules
const getSchedules = asyncHandler(async (req, res) => {
  const { subjectId } = req.query;
  try {
    const schedules = await prisma.examSchedule.findMany({
      where: subjectId ? { subjectId } : undefined,
      include: { subject: { select: { name: true, code: true } } },
      orderBy: { examDate: "desc" },
    });
    res.json({ success: true, data: schedules });
  } catch (err) {
    console.log("Exam schedule fetch error:", err.message);
    res.json({ success: true, data: [] });
  }
});

// GET /api/exams/subjects (ड्रॉपडाउन के लिए सभी विषयों को फेच करना)
const getSubjects = asyncHandler(async (req, res) => {
  const subjects = await prisma.subject.findMany({
    orderBy: { name: "asc" },
  });
  res.json({ success: true, data: subjects });
});

// POST /api/exams/schedules/:id/results  (bulk marks entry)
const enterResults = asyncHandler(async (req, res) => {
  const results = z.array(resultSchema).min(1).parse(req.body.results);
  const scheduleId = req.params.id;

  const schedule = await prisma.examSchedule.findUnique({ where: { id: scheduleId } });
  if (!schedule) throw new ApiError(404, "Exam schedule not found");

  const created = await prisma.$transaction(
    results.map((r) =>
      prisma.examResult.upsert({
        where: { examScheduleId_studentId: { examScheduleId: scheduleId, studentId: r.studentId } },
        update: r,
        create: { ...r, examScheduleId: scheduleId },
      })
    )
  );

  res.json({ success: true, data: created, message: `${created.length} result(s) saved` });
});

// GET /api/exams/results/student/:studentId
const getStudentResults = asyncHandler(async (req, res) => {
  const results = await prisma.examResult.findMany({
    where: { studentId: req.params.studentId },
    include: { examSchedule: { include: { subject: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json({ success: true, data: results });
});

// GET /api/exams/marksheet/:studentId -> PDF
const downloadMarksheet = asyncHandler(async (req, res) => {
  const student = await prisma.student.findUnique({ where: { id: req.params.studentId } });
  if (!student) throw new ApiError(404, "Student not found");

  const results = await prisma.examResult.findMany({
    where: { studentId: req.params.studentId },
    include: { examSchedule: { include: { subject: true } } },
    orderBy: { createdAt: "desc" },
  });

  const doc = new PDFDocument({ size: "A4", margin: 50 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=marksheet-${student.admissionNo}.pdf`);
  doc.pipe(res);

  doc.fontSize(18).fillColor("#4F46E5").text("College ERP System - Marksheet", { align: "center" });
  doc.moveDown();
  doc.fontSize(11).fillColor("#000").text(`Name: ${student.firstName} ${student.lastName}`);
  doc.text(`Admission No: ${student.admissionNo}`);
  doc.moveDown();

  results.forEach((r) => {
    doc.text(
      `${r.examSchedule.subject.name} (${r.examSchedule.examType}): ${r.marksObtained}/${r.examSchedule.maxMarks}  Grade: ${r.grade || "-"}`
    );
  });

  doc.end();
});

module.exports = { 
  createSchedule, 
  getSchedules, 
  getSubjects, 
  enterResults, 
  getStudentResults, 
  downloadMarksheet 
};