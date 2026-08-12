// server/src/config/db.js
const { PrismaClient } = require("@prisma/client");

// Reuse a single PrismaClient instance (important in dev with nodemon reloads)
const globalForPrisma = global;

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;
