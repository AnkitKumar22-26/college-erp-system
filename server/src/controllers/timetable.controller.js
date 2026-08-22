// server/src/controllers/timetable.controller.js
const { z } = require("zod");
const XLSX = require("xlsx");
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
      slots: { 
        include: { 
          subject: true, 
          faculty: { select: { firstName: true, lastName: true } } 
        },
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }]
      },
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

// POST /api/timetable/upload (Safe & Robust Excel Upload)
const uploadTimetableExcel = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "Please upload an excel file");

  const { departmentId, semester, academicYear, section } = req.body;
  if (!departmentId || !semester) {
    throw new ApiError(400, "Department and semester are required");
  }

  const targetSection = section || "S1";

  // Read Excel Workbook buffer using xlsx
  const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const rawRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

  if (!rawRows || rawRows.length === 0) {
    throw new ApiError(400, "The uploaded excel sheet is empty");
  }

  // Filter rows for target section
  const filteredRows = rawRows.filter(row => {
    const cleanRow = {};
    Object.keys(row).forEach(k => cleanRow[k.trim()] = row[k]);
    const secVal = String(cleanRow.Section || cleanRow.SECTION || "").trim();
    if (!secVal) return true;
    return secVal.toLowerCase() === targetSection.toLowerCase();
  });

  const rowsToProcess = filteredRows.length > 0 ? filteredRows : rawRows;

  // Find or create timetable section safely
  let timetable = await prisma.timetable.findFirst({
    where: { departmentId, semester: parseInt(semester, 10), section: targetSection },
  });

  if (!timetable) {
    timetable = await prisma.timetable.create({
      data: { 
        departmentId, 
        semester: parseInt(semester, 10), 
        section: targetSection, 
        academicYear: academicYear || "2026-2027" 
      },
    });
  } else {
    await prisma.timetableSlot.deleteMany({ where: { timetableId: timetable.id } });
  }

  let allSubjects = await prisma.subject.findMany();
  let allFaculty = await prisma.faculty.findMany();

  const TIME_SLOTS_POOL = [
    { start: "09:00 AM", end: "10:00 AM" },
    { start: "10:00 AM", end: "11:00 AM" },
    { start: "11:10 AM", end: "12:05 PM" },
    { start: "12:05 PM", end: "01:00 PM" },
    { start: "01:50 PM", end: "02:40 PM" },
    { start: "02:50 PM", end: "03:40 PM" },
    { start: "03:40 PM", end: "04:30 PM" },
  ];

  let addedCount = 0;
  let dayCounter = 1; // 1 = Monday ... 6 = Saturday
  let slotIndex = 0;   // 0 to 6 period index

  for (const row of rowsToProcess) {
    const cleanRow = {};
    Object.keys(row).forEach(key => {
      cleanRow[key.trim()] = row[key];
    });

    const subName = String(cleanRow.Subject || cleanRow.SUBJECT || "").trim();
    const facName = String(cleanRow.Faculty || cleanRow.FACULTY || "").trim();
    const roomNo = String(cleanRow.Room || cleanRow.ROOM || "B-302").trim();

    if (!subName || !facName) continue;

    // 1. Find or Safe Create Subject
    let subject = allSubjects.find(s => 
      s.name.toLowerCase() === subName.toLowerCase() || 
      s.code?.toLowerCase() === subName.toLowerCase()
    );

    if (!subject) {
      try {
        const uniqueCode = `${subName.substring(0, 4).toUpperCase()}_${Date.now().toString().slice(-4)}`;
        subject = await prisma.subject.create({
          data: { name: subName, code: uniqueCode }
        });
        allSubjects.push(subject);
      } catch (err) {
        subject = await prisma.subject.findFirst();
      }
    }

    // 2. Find or Safe Create Faculty
    let faculty = allFaculty.find(f => {
      const fullName = `${f.firstName || ""} ${f.lastName || ""}`.trim().toLowerCase();
      return fullName === facName.toLowerCase() || f.firstName?.toLowerCase() === facName.toLowerCase();
    });

    if (!faculty) {
      try {
        const nameParts = facName.split(" ");
        const uniqueEmail = `faculty_${Date.now()}_${Math.floor(Math.random() * 1000)}@srimt.ac.in`;
        faculty = await prisma.faculty.create({
          data: { 
            firstName: nameParts[0] || facName, 
            lastName: nameParts.slice(1).join(" ") || "Faculty",
            email: uniqueEmail
          }
        });
        allFaculty.push(faculty);
      } catch (err) {
        faculty = await prisma.faculty.findFirst();
      }
    }

    if (!subject || !faculty) continue;

    const currentSlotTime = TIME_SLOTS_POOL[slotIndex];

    // 3. Create Slot
    await prisma.timetableSlot.create({
      data: {
        timetableId: timetable.id,
        subjectId: subject.id,
        facultyId: faculty.id,
        dayOfWeek: cleanRow.dayOfWeek !== undefined ? parseInt(cleanRow.dayOfWeek, 10) : dayCounter,
        startTime: cleanRow.startTime || currentSlotTime.start,
        endTime: cleanRow.endTime || currentSlotTime.end,
        room: roomNo,
      },
    });

    addedCount++;
    slotIndex++;

    if (slotIndex >= TIME_SLOTS_POOL.length) {
      slotIndex = 0;
      dayCounter++;
      if (dayCounter > 6) dayCounter = 1;
    }
  }

  res.status(201).json({ success: true, message: `Successfully mapped and generated ${addedCount} slots into matrix grid!` });
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

module.exports = { createTimetable, getTimetables, addSlot, uploadTimetableExcel, getFacultyTimetable };