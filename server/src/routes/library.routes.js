// server/src/routes/library.routes.js
const express = require("express");
const router = express.Router();
const {
  createBook,
  getBooks,
  issueBook,
  returnBook,
  getStudentIssues,
} = require("../controllers/library.controller");
const { authenticate, authorize } = require("../middleware/auth");

const LIB_ROLES = ["ADMIN", "PRINCIPAL", "LIBRARIAN"];

router.use(authenticate);

router.post("/books", authorize(...LIB_ROLES), createBook);
router.get("/books", authorize(...LIB_ROLES, "STUDENT", "FACULTY"), getBooks);
router.post("/issue", authorize(...LIB_ROLES), issueBook);
router.post("/return/:issueId", authorize(...LIB_ROLES), returnBook);
router.get("/issues/student/:studentId", authorize(...LIB_ROLES, "STUDENT"), getStudentIssues);

module.exports = router;
