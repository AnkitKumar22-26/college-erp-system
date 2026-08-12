// server/src/controllers/auth.controller.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const signAccessToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });

const generateRefreshToken = async (userId) => {
  const token = crypto.randomBytes(48).toString("hex");
  const days = parseInt((process.env.JWT_REFRESH_EXPIRES_IN || "7d").replace("d", ""), 10) || 7;
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: { token, userId, expiresAt },
  });

  return token;
};

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      student: { select: { id: true, firstName: true, lastName: true, photoUrl: true } },
      faculty: { select: { id: true, firstName: true, lastName: true, photoUrl: true } },
    },
  });

  if (!user || !user.isActive) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  const accessToken = signAccessToken(user);
  const refreshToken = await generateRefreshToken(user.id);

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const profile = user.student || user.faculty || null;

  res.json({
    success: true,
    data: {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: profile ? `${profile.firstName} ${profile.lastName}` : user.email,
        photoUrl: profile?.photoUrl || null,
      },
    },
  });
});

// POST /api/auth/refresh
const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  const stored = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  });

  if (!stored || stored.expiresAt < new Date()) {
    throw new ApiError(401, "Refresh token is invalid or expired");
  }

  const accessToken = signAccessToken(stored.user);
  res.json({ success: true, data: { accessToken } });
});

// POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  }
  res.json({ success: true, message: "Logged out successfully" });
});

// GET /api/auth/me
const me = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      role: true,
      student: { select: { id: true, firstName: true, lastName: true, photoUrl: true, departmentId: true } },
      faculty: { select: { id: true, firstName: true, lastName: true, photoUrl: true, departmentId: true } },
    },
  });

  const profile = user.student || user.faculty || null;

  res.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: profile ? `${profile.firstName} ${profile.lastName}` : user.email,
      photoUrl: profile?.photoUrl || null,
      departmentId: profile?.departmentId || null,
    },
  });
});

// POST /api/auth/change-password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new ApiError(400, "Current password is incorrect");
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });

  res.json({ success: true, message: "Password changed successfully" });
});

module.exports = { login, refresh, logout, me, changePassword };
