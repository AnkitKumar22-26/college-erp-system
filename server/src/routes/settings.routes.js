// server/src/routes/settings.routes.js
const express = require("express");
const router = express.Router();
const { getSettings, updateSettings } = require("../controllers/settings.controller");
const { authenticate, authorize } = require("../middleware/auth");
const { uploadCollegeAsset } = require("../middleware/upload");

router.use(authenticate);

router.get("/", getSettings);
router.put(
  "/",
  authorize("ADMIN", "PRINCIPAL"),
  uploadCollegeAsset.single("logo"),
  updateSettings
);

module.exports = router;
