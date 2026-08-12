// server/src/middleware/errorHandler.js
const multer = require("multer");
const { ZodError } = require("zod");
const ApiError = require("../utils/ApiError");

/* eslint-disable no-unused-vars */
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Zod validation errors thrown directly via schema.parse() (used by several
  // controllers that don't go through the `validate` middleware)
  if (error instanceof ZodError) {
    const details = error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    error = new ApiError(422, "Validation failed", details);
  }

  // Multer errors (file too large, etc.)
  if (error instanceof multer.MulterError) {
    error = new ApiError(400, error.message);
  }

  // Prisma known errors
  if (error.code === "P2002") {
    const field = Array.isArray(error.meta?.target)
      ? error.meta.target.join(", ")
      : error.meta?.target;
    error = new ApiError(409, `A record with this ${field} already exists`);
  }
  if (error.code === "P2025") {
    error = new ApiError(404, "Requested record was not found");
  }
  if (error.code === "P2003") {
    error = new ApiError(400, "Invalid reference to a related record");
  }
  if (error.code === "P2021" || error.code === "P2022") {
    error = new ApiError(
      500,
      "Database table/column not found. Run: cd server && npx prisma migrate dev"
    );
  }

  const statusCode = error.statusCode || 500;
  const message = error.isOperational ? error.message : "Internal server error";

  // ALWAYS log the real error server-side, regardless of NODE_ENV.
  // This is what shows up in the terminal running `npm run dev`.
  if (!error.isOperational || statusCode >= 500) {
    console.error("---- API ERROR ----");
    console.error(`${req.method} ${req.originalUrl}`);
    console.error(err);
    console.error("--------------------");
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(error.details ? { details: error.details } : {}),
    ...(process.env.NODE_ENV === "development" && !error.isOperational
      ? { stack: err.stack }
      : {}),
  });
};

const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

module.exports = { errorHandler, notFound };