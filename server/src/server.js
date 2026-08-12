// server/src/server.js
require("dotenv").config();
const app = require("./app");
const prisma = require("./config/db");

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`College ERP API listening on http://localhost:${PORT}`);
});

const shutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    console.log("Server closed.");
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});
