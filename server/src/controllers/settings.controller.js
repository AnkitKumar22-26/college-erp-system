// server/src/controllers/settings.controller.js
const { z } = require("zod");
const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");

const settingsSchema = z.object({
  collegeName: z.string().min(1),
  address: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  academicYear: z.string().min(4),
  currentSemester: z.coerce.number().int().min(1).max(12).default(1),
});

// GET /api/settings
const getSettings = asyncHandler(async (req, res) => {
  let settings = await prisma.collegeSettings.findFirst();
  if (!settings) {
    settings = await prisma.collegeSettings.create({
      data: { collegeName: "My College", academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}` },
    });
  }
  res.json({ success: true, data: settings });
});

// PUT /api/settings
const updateSettings = asyncHandler(async (req, res) => {
  const data = settingsSchema.partial().parse(req.body);
  if (req.file) data.logoUrl = `/uploads/college/${req.file.filename}`;

  let settings = await prisma.collegeSettings.findFirst();
  if (!settings) {
    settings = await prisma.collegeSettings.create({
      data: { collegeName: "My College", academicYear: "2025-2026", ...data },
    });
  } else {
    settings = await prisma.collegeSettings.update({ where: { id: settings.id }, data });
  }

  res.json({ success: true, data: settings, message: "Settings updated" });
});

module.exports = { getSettings, updateSettings };
