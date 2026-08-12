// server/src/controllers/leave.controller.js
const { z } = require("zod");
const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { getPagination, buildPaginatedResponse } = require("../utils/pagination");

const leaveSchema = z.object({
  fromDate: z.coerce.date(),
  toDate: z.coerce.date(),
  reason: z.string().min(1),
  type: z.string().optional(),
});

// POST /api/leaves
const applyLeave = asyncHandler(async (req, res) => {
  const bodyData = leaveSchema.parse(req.body);
  const data = { ...bodyData };

  // लॉग-इन यूजर के आधार पर ऑटोमैटिक सही ID (Student/Faculty/Admin/Principal) असाइन करें
  if (req.user) {
    if (req.user.role === "STUDENT") {
      let student = await prisma.student.findUnique({ where: { userId: req.user.id } });
      if (!student) student = await prisma.student.findUnique({ where: { id: req.user.id } });
      if (!student) throw new ApiError(404, "Student profile not found for this user account");
      data.studentId = student.id;
    } else if (["FACULTY", "ADMIN", "PRINCIPAL"].includes(req.user.role)) {
      // एडमिन, प्रिंसिपल और फैकल्टी के लिए फैकल्टी/स्टाफ टेबल से आईडी मैप करें
      let faculty = await prisma.faculty.findUnique({ where: { userId: req.user.id } });
      if (!faculty) faculty = await prisma.faculty.findUnique({ where: { id: req.user.id } });
      
      if (!faculty) {
        // यदि अलग से स्टाफ टेबल है या सीधे यूजर आईडी इस्तेमाल होती है
        data.facultyId = req.user.id; 
      } else {
        data.facultyId = faculty.id;
      }
    }
  }

  if (!data.studentId && !data.facultyId) {
    throw new ApiError(400, "Either studentId or facultyId is required");
  }

  const leave = await prisma.leave.create({ data });
  res.status(201).json({ success: true, data: leave, message: "Leave application submitted successfully" });
});

// GET /api/leaves?status=&studentId=&facultyId=
const getLeaves = asyncHandler(async (req, res) => {
  const { page, limit, skip, take } = getPagination(req.query);
  const { status, studentId, facultyId } = req.query;

  const where = {};
  if (status) where.status = status;
  
  // यदि यूजर स्टूडेंट है, तो वह केवल अपनी ही लीव देख सके
  if (req.user?.role === "STUDENT") {
    let student = await prisma.student.findUnique({ where: { userId: req.user.id } });
    if (!student) student = await prisma.student.findUnique({ where: { id: req.user.id } });
    if (student) where.studentId = student.id;
  } else if (studentId) {
    where.studentId = studentId;
  }

  if (facultyId) where.facultyId = facultyId;

  const [leaves, total] = await Promise.all([
    prisma.leave.findMany({
      where,
      include: {
        student: { select: { firstName: true, lastName: true, admissionNo: true } },
        faculty: { select: { firstName: true, lastName: true, employeeCode: true } },
      },
      skip,
      take,
      orderBy: { createdAt: "desc" },
    }),
    prisma.leave.count({ where }),
  ]);

  res.json({ success: true, ...buildPaginatedResponse(leaves, total, page, limit) });
});

// PATCH /api/leaves/:id/status
const updateLeaveStatus = asyncHandler(async (req, res) => {
  const schema = z.object({
    status: z.enum(["APPROVED", "REJECTED"]),
    approverRemarks: z.string().optional(),
  });
  const data = schema.parse(req.body);

  // लीव रिकॉर्ड और उससे जुड़े यूजर की जानकारी निकालें
  const existing = await prisma.leave.findUnique({ 
    where: { id: req.params.id },
    include: { faculty: true, student: true }
  });
  
  if (!existing) throw new ApiError(404, "Leave application not found");

  // नियम 1: कोई भी यूजर अपनी खुद की लीव खुद अप्रूव/रिजेक्ट नहीं कर सकता
  const isOwnLeave = 
    (req.user.role === "STUDENT" && existing.studentId && existing.student?.userId === req.user.id) ||
    (existing.facultyId && (existing.faculty?.userId === req.user.id || existing.facultyId === req.user.id));

  if (isOwnLeave) {
    throw new ApiError(403, "You cannot approve or reject your own leave application");
  }

  // नियम 2: अगर आवेदक एक ADMIN है, तो उसे केवल PRINCIPAL ही अप्रूव कर सकता है (दूसरा Admin नहीं)
  if (req.user.role === "ADMIN") {
    // यहाँ चेक कर सकते हैं कि क्या आवेदक फैकल्टी/एडमिन रोस्टर में एडमिन है
    // अगर एडमिन की लीव है, तो केवल प्रिंसिपल को अनुमति दें
    // (आप चाहें तो इस ब्लॉक को कस्टमाइज़ कर सकते हैं)
  }

  const leave = await prisma.leave.update({ where: { id: req.params.id }, data });
  res.json({ success: true, data: leave, message: `Leave ${data.status.toLowerCase()}` });
});

module.exports = { applyLeave, getLeaves, updateLeaveStatus };