// server/src/controllers/transport.controller.js
const { z } = require("zod");
const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

// POST /api/transport/routes
const createRoute = asyncHandler(async (req, res) => {
  const schema = z.object({ name: z.string().min(1) });
  const data = schema.parse(req.body);
  const route = await prisma.route.create({ data });
  res.status(201).json({ success: true, data: route, message: "Route created" });
});

// GET /api/transport/routes
const getRoutes = asyncHandler(async (req, res) => {
  const routes = await prisma.route.findMany({ include: { vehicles: true } });
  res.json({ success: true, data: routes });
});

// POST /api/transport/vehicles
const createVehicle = asyncHandler(async (req, res) => {
  const schema = z.object({
    routeId: z.string().uuid(),
    vehicleNo: z.string().min(1),
    driverName: z.string().min(1),
    driverPhone: z.string().min(7),
    capacity: z.coerce.number().int().min(1).default(40),
  });
  const data = schema.parse(req.body);
  const vehicle = await prisma.vehicle.create({ data });
  res.status(201).json({ success: true, data: vehicle, message: "Vehicle added" });
});

// GET /api/transport/vehicles
const getVehicles = asyncHandler(async (req, res) => {
  const vehicles = await prisma.vehicle.findMany({
    include: { route: true, allocations: true },
  });
  res.json({ success: true, data: vehicles });
});

// POST /api/transport/allocate
const allocateStudent = asyncHandler(async (req, res) => {
  const schema = z.object({
    studentId: z.string().uuid(),
    vehicleId: z.string().uuid(),
    pickupPoint: z.string().min(1),
  });
  const { studentId, vehicleId, pickupPoint } = schema.parse(req.body);

  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    include: { allocations: true },
  });
  if (!vehicle) throw new ApiError(404, "Vehicle not found");
  if (vehicle.allocations.length >= vehicle.capacity) {
    throw new ApiError(400, "Vehicle is at full capacity");
  }

  const allocation = await prisma.transportAllocation.upsert({
    where: { studentId },
    update: { vehicleId, pickupPoint },
    create: { studentId, vehicleId, pickupPoint },
  });

  res.status(201).json({ success: true, data: allocation, message: "Student allocated to transport" });
});

module.exports = { createRoute, getRoutes, createVehicle, getVehicles, allocateStudent };
