// server/src/controllers/hostel.controller.js
const { z } = require("zod");
const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

// POST /api/hostel
const createHostel = asyncHandler(async (req, res) => {
  const schema = z.object({ name: z.string().min(1), warden: z.string().optional() });
  const data = schema.parse(req.body);
  const hostel = await prisma.hostel.create({ data });
  res.status(201).json({ success: true, data: hostel, message: "Hostel created" });
});

// GET /api/hostel
const getHostels = asyncHandler(async (req, res) => {
  const hostels = await prisma.hostel.findMany({
    include: { rooms: { include: { allocations: true } } },
  });
  res.json({ success: true, data: hostels });
});

// POST /api/hostel/:id/rooms
const createRoom = asyncHandler(async (req, res) => {
  const schema = z.object({
    roomNo: z.string().min(1),
    capacity: z.coerce.number().int().min(1).default(2),
  });
  const data = schema.parse(req.body);
  const room = await prisma.room.create({ data: { ...data, hostelId: req.params.id } });
  res.status(201).json({ success: true, data: room, message: "Room created" });
});

// GET /api/hostel/vacancy
const getVacancy = asyncHandler(async (req, res) => {
  const rooms = await prisma.room.findMany({
    include: { allocations: true, hostel: { select: { name: true } } },
  });
  const data = rooms.map((r) => ({
    roomId: r.id,
    hostel: r.hostel.name,
    roomNo: r.roomNo,
    capacity: r.capacity,
    occupied: r.allocations.length,
    vacant: r.capacity - r.allocations.length,
  }));
  res.json({ success: true, data });
});

// POST /api/hostel/allocate
const allocateStudent = asyncHandler(async (req, res) => {
  const schema = z.object({
    studentId: z.string().uuid(),
    roomId: z.string().uuid(),
    bedNo: z.coerce.number().int().min(1),
  });
  const { studentId, roomId, bedNo } = schema.parse(req.body);

  const room = await prisma.room.findUnique({ where: { id: roomId }, include: { allocations: true } });
  if (!room) throw new ApiError(404, "Room not found");
  if (room.allocations.length >= room.capacity) throw new ApiError(400, "Room is at full capacity");

  const allocation = await prisma.hostelAllocation.upsert({
    where: { studentId },
    update: { roomId, bedNo },
    create: { studentId, roomId, bedNo },
  });

  res.status(201).json({ success: true, data: allocation, message: "Student allocated to room" });
});

module.exports = { createHostel, getHostels, createRoom, getVacancy, allocateStudent };
