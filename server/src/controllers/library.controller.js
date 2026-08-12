// server/src/controllers/library.controller.js
const { z } = require("zod");
const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { getPagination, buildPaginatedResponse } = require("../utils/pagination");

const FINE_PER_DAY = 5;

const bookSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  category: z.string().min(1),
  isbn: z.string().min(1),
  totalCopies: z.coerce.number().int().min(1).default(1),
});

// POST /api/library/books
const createBook = asyncHandler(async (req, res) => {
  const data = bookSchema.parse(req.body);
  const book = await prisma.book.create({ data: { ...data, available: data.totalCopies } });
  res.status(201).json({ success: true, data: book, message: "Book added" });
});

// GET /api/library/books
const getBooks = asyncHandler(async (req, res) => {
  const { page, limit, skip, take } = getPagination(req.query);
  const { search, category } = req.query;

  const where = {};
  if (category) where.category = category;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { author: { contains: search, mode: "insensitive" } },
      { isbn: { contains: search, mode: "insensitive" } },
    ];
  }

  const [books, total] = await Promise.all([
    prisma.book.findMany({ where, skip, take, orderBy: { title: "asc" } }),
    prisma.book.count({ where }),
  ]);

  res.json({ success: true, ...buildPaginatedResponse(books, total, page, limit) });
});

// POST /api/library/issue
const issueBook = asyncHandler(async (req, res) => {
  const schema = z.object({
    bookId: z.string().uuid(),
    studentId: z.string().uuid(),
    dueDate: z.coerce.date(),
  });
  const { bookId, studentId, dueDate } = schema.parse(req.body);

  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book) throw new ApiError(404, "Book not found");
  if (book.available < 1) throw new ApiError(400, "No copies available");

  const [issue] = await prisma.$transaction([
    prisma.bookIssue.create({ data: { bookId, studentId, dueDate, status: "ISSUED" } }),
    prisma.book.update({ where: { id: bookId }, data: { available: { decrement: 1 } } }),
  ]);

  res.status(201).json({ success: true, data: issue, message: "Book issued" });
});

// POST /api/library/return/:issueId
const returnBook = asyncHandler(async (req, res) => {
  const issue = await prisma.bookIssue.findUnique({ where: { id: req.params.issueId } });
  if (!issue) throw new ApiError(404, "Issue record not found");
  if (issue.status === "RETURNED") throw new ApiError(400, "Book already returned");

  const returnDate = new Date();
  const daysLate = Math.max(
    Math.ceil((returnDate - new Date(issue.dueDate)) / (1000 * 60 * 60 * 24)),
    0
  );
  const fine = daysLate * FINE_PER_DAY;

  const [updated] = await prisma.$transaction([
    prisma.bookIssue.update({
      where: { id: req.params.issueId },
      data: { returnDate, status: "RETURNED", fine },
    }),
    prisma.book.update({ where: { id: issue.bookId }, data: { available: { increment: 1 } } }),
  ]);

  res.json({ success: true, data: updated, message: `Book returned. Fine: Rs. ${fine}` });
});

// GET /api/library/issues/student/:studentId
const getStudentIssues = asyncHandler(async (req, res) => {
  const issues = await prisma.bookIssue.findMany({
    where: { studentId: req.params.studentId },
    include: { book: true },
    orderBy: { issueDate: "desc" },
  });
  res.json({ success: true, data: issues });
});

module.exports = { createBook, getBooks, issueBook, returnBook, getStudentIssues };
