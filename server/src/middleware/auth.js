// server/src/middleware/auth.js
const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const prisma = require("../config/db");

/**
 * Verifies the Bearer JWT access token and attaches `req.user`.
 */
const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    throw new ApiError(401, "Authentication token missing");
  }

  const token = header.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new ApiError(401, "Access token expired");
    }
    throw new ApiError(401, "Invalid access token");
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.sub },
    select: { id: true, email: true, role: true, isActive: true },
  });

  if (!user || !user.isActive) {
    throw new ApiError(401, "User no longer exists or is inactive");
  }

  req.user = user;
  next();
});

/**
 * Restricts a route to the given list of roles.
 * Usage: authorize("ADMIN", "PRINCIPAL")
 */
const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, "Not authenticated");
  }
  if (!allowedRoles.includes(req.user.role)) {
    throw new ApiError(403, "You do not have permission to perform this action");
  }
  next();
};

module.exports = { authenticate, authorize };
