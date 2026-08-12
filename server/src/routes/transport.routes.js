// server/src/routes/transport.routes.js
const express = require("express");
const router = express.Router();
const {
  createRoute,
  getRoutes,
  createVehicle,
  getVehicles,
  allocateStudent,
} = require("../controllers/transport.controller");
const { authenticate, authorize } = require("../middleware/auth");

const ADMIN_ROLES = ["ADMIN", "PRINCIPAL", "RECEPTIONIST"];

router.use(authenticate);

router.post("/routes", authorize(...ADMIN_ROLES), createRoute);
router.get("/routes", authorize(...ADMIN_ROLES, "STUDENT"), getRoutes);
router.post("/vehicles", authorize(...ADMIN_ROLES), createVehicle);
router.get("/vehicles", authorize(...ADMIN_ROLES), getVehicles);
router.post("/allocate", authorize(...ADMIN_ROLES), allocateStudent);



module.exports = router;


// hello 