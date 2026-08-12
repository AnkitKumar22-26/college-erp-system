// server/src/middleware/upload.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const ApiError = require("../utils/ApiError");

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

const makeStorage = (subfolder) => {
  const dest = path.join(__dirname, "..", "..", "uploads", subfolder);
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dest),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, unique);
    },
  });
};

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME.includes(file.mimetype)) {
    return cb(new ApiError(400, "Only JPG, PNG, WEBP or PDF files are allowed"));
  }
  cb(null, true);
};

const maxSize = (parseInt(process.env.UPLOAD_MAX_SIZE_MB, 10) || 5) * 1024 * 1024;

const uploadStudentPhoto = multer({
  storage: makeStorage("students"),
  fileFilter,
  limits: { fileSize: maxSize },
});

const uploadFacultyPhoto = multer({
  storage: makeStorage("faculty"),
  fileFilter,
  limits: { fileSize: maxSize },
});

const uploadCollegeAsset = multer({
  storage: makeStorage("college"),
  fileFilter,
  limits: { fileSize: maxSize },
});

module.exports = { uploadStudentPhoto, uploadFacultyPhoto, uploadCollegeAsset };
