// server/src/app.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const path = require("path");

const routes = require("./routes");
const { errorHandler, notFound } = require("./middleware/errorHandler");

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Basic rate limiting on auth endpoints to slow brute force attempts
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/auth/login", authLimiter);

// Static file serving for uploaded photos/documents
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "College ERP API is running", time: new Date().toISOString() });
});

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
