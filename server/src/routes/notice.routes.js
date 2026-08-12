// server/src/routes/notice.routes.js
const express = require("express");
const router = express.Router();
const { createNotice, getNotices, deleteNotice } = require("../controllers/notice.controller");
const { authenticate, authorize } = require("../middleware/auth");
const { uploadCollegeAsset } = require("../middleware/upload");

router.use(authenticate);

router.post(
  "/",
  authorize("ADMIN", "PRINCIPAL", "HOD"),
  uploadCollegeAsset.single("attachment"),
  createNotice
);
router.get("/", getNotices);
router.delete("/:id", authorize("ADMIN", "PRINCIPAL", "HOD"), deleteNotice);

module.exports = router;
