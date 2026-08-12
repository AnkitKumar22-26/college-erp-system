// server/src/controllers/notice.controller.js
const { z } = require("zod");
const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { getPagination, buildPaginatedResponse } = require("../utils/pagination");

const noticeSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  audience: z
    .array(
      z.enum([
        "ADMIN",
        "PRINCIPAL",
        "HOD",
        "FACULTY",
        "STUDENT",
        "ACCOUNTANT",
        "LIBRARIAN",
        "RECEPTIONIST",
      ])
    )
    .min(1),
});

// POST /api/notices
const createNotice = asyncHandler(async (req, res) => {
  const data = noticeSchema.parse(req.body);
  const attachment = req.file ? `/uploads/college/${req.file.filename}` : null;

  const notice = await prisma.notice.create({
    data: { ...data, attachment, createdById: req.user.id },
  });
  res.status(201).json({ success: true, data: notice, message: "Notice published" });
});

// GET /api/notices (फिक्स किया गया ताकि स्टूडेंट को उसके रोल के हिसाब से नोटिस दिखें)
const getNotices = asyncHandler(async (req, res) => {
  const { page, limit, skip, take } = getPagination(req.query);
  const userRole = req.user?.role;

  // यदि यूजर का रोल है, तो ऐसा नोटिस ढूंढें जिसके audience एरे में वह रोल मौजूद हो
  // साथ ही अगर कोई एरर या पुराना डेटा हो तो सुरक्षा के लिए फॉールबैक भी रखा गया है
  const where = userRole
    ? {
        OR: [
          { audience: { has: userRole } },
          { audience: { has: "STUDENT" } }, // यदि स्टूडेंट लॉगिन है तो कम से कम स्टूडेंट वाले सारे दिखें
        ],
      }
    : {};

  // अगर ऊपर वाला फिल्टर डेटाबेस में एरे होने के कारण काम न करे, तो सभी नोटिस लाकर फ्रंटएंड पर भी सेफ रख सकते हैं, 
  // पर यहाँ हमने Prisma का सही एरे कवेरी (has) इस्तेमाल किया है।
  const [notices, total] = await Promise.all([
    prisma.notice.findMany({
      where: userRole ? { audience: { has: userRole } } : {},
      include: { createdBy: { select: { email: true, role: true } } },
      skip,
      take,
      orderBy: { createdAt: "desc" },
    }),
    prisma.notice.count({ where: userRole ? { audience: { has: userRole } } : {} }),
  ]);

  res.json({ success: true, ...buildPaginatedResponse(notices, total, page, limit) });
});

// DELETE /api/notices/:id
const deleteNotice = asyncHandler(async (req, res) => {
  const existing = await prisma.notice.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new ApiError(404, "Notice not found");
  await prisma.notice.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: "Notice deleted" });
});

module.exports = { createNotice, getNotices, deleteNotice };