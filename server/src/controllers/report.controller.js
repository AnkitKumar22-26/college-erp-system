// server/src/controllers/report.controller.js
const prisma = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const { exportToExcel } = require("../utils/excel");

// GET /api/reports/students/excel
const studentReport = asyncHandler(async (req, res) => {
  const students = await prisma.student.findMany({
    include: { department: { select: { name: true } } },
    orderBy: { admissionNo: "asc" },
  });

  await exportToExcel(res, {
    sheetName: "Student Report",
    filename: "student-report.xlsx",
    columns: [
      { header: "Admission No", key: "admissionNo", width: 16 },
      { header: "Name", key: "name", width: 22 },
      { header: "Department", key: "department", width: 18 },
      { header: "Semester", key: "semester", width: 10 },
      { header: "Status", key: "status", width: 14 },
    ],
    rows: students.map((s) => ({
      admissionNo: s.admissionNo,
      name: `${s.firstName} ${s.lastName}`,
      department: s.department?.name,
      semester: s.semester,
      status: s.status,
    })),
  });
});

// GET /api/reports/faculty/excel
const facultyReport = asyncHandler(async (req, res) => {
  const faculty = await prisma.faculty.findMany({
    include: { department: { select: { name: true } } },
    orderBy: { employeeCode: "asc" },
  });

  await exportToExcel(res, {
    sheetName: "Faculty Report",
    filename: "faculty-report.xlsx",
    columns: [
      { header: "Employee Code", key: "employeeCode", width: 16 },
      { header: "Name", key: "name", width: 22 },
      { header: "Department", key: "department", width: 18 },
      { header: "Designation", key: "designation", width: 18 },
      { header: "Active", key: "active", width: 10 },
    ],
    rows: faculty.map((f) => ({
      employeeCode: f.employeeCode,
      name: `${f.firstName} ${f.lastName}`,
      department: f.department?.name,
      designation: f.designation,
      active: f.isActive ? "Yes" : "No",
    })),
  });
});

// GET /api/reports/library/excel
const libraryReport = asyncHandler(async (req, res) => {
  const issues = await prisma.bookIssue.findMany({
    include: {
      book: true,
      student: { select: { firstName: true, lastName: true, admissionNo: true } },
    },
    orderBy: { issueDate: "desc" },
  });

  await exportToExcel(res, {
    sheetName: "Library Report",
    filename: "library-report.xlsx",
    columns: [
      { header: "Book", key: "book", width: 24 },
      { header: "Student", key: "student", width: 22 },
      { header: "Issue Date", key: "issueDate", width: 14 },
      { header: "Due Date", key: "dueDate", width: 14 },
      { header: "Status", key: "status", width: 12 },
      { header: "Fine", key: "fine", width: 10 },
    ],
    rows: issues.map((i) => ({
      book: i.book.title,
      student: `${i.student.firstName} ${i.student.lastName}`,
      issueDate: new Date(i.issueDate).toLocaleDateString("en-IN"),
      dueDate: new Date(i.dueDate).toLocaleDateString("en-IN"),
      status: i.status,
      fine: Number(i.fine),
    })),
  });
});

// GET /api/reports/placements/excel
const placementReport = asyncHandler(async (req, res) => {
  const selections = await prisma.placementSelection.findMany({
    include: {
      student: { select: { firstName: true, lastName: true, admissionNo: true } },
      drive: { include: { company: true } },
    },
    orderBy: { selectedAt: "desc" },
  });

  await exportToExcel(res, {
    sheetName: "Placement Report",
    filename: "placement-report.xlsx",
    columns: [
      { header: "Student", key: "student", width: 22 },
      { header: "Company", key: "company", width: 20 },
      { header: "Role", key: "role", width: 18 },
      { header: "Package (LPA)", key: "package", width: 16 },
      { header: "Selected On", key: "date", width: 14 },
    ],
    rows: selections.map((s) => ({
      student: `${s.student.firstName} ${s.student.lastName}`,
      company: s.drive.company.name,
      role: s.drive.role,
      package: Number(s.drive.packageLPA),
      date: new Date(s.selectedAt).toLocaleDateString("en-IN"),
    })),
  });
});

module.exports = { studentReport, facultyReport, libraryReport, placementReport };
