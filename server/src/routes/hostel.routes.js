// server/src/routes/hostel.routes.js
const express = require("express");
const router = express.Router();
const {
  createHostel,
  getHostels,
  createRoom,
  getVacancy,
  allocateStudent,
} = require("../controllers/hostel.controller");
const { authenticate, authorize } = require("../middleware/auth");

const ADMIN_ROLES = ["ADMIN", "PRINCIPAL", "RECEPTIONIST"];

router.use(authenticate);

router.post("/", authorize(...ADMIN_ROLES), createHostel);
router.get("/", authorize(...ADMIN_ROLES, "STUDENT"), getHostels);
router.post("/:id/rooms", authorize(...ADMIN_ROLES), createRoom);
router.get("/vacancy", authorize(...ADMIN_ROLES), getVacancy);
router.post("/allocate", authorize(...ADMIN_ROLES), allocateStudent);

module.exports = router;
