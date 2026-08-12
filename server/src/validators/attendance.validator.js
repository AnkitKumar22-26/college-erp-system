// server/src/validators/attendance.validator.js
const { z } = require("zod");

const attendanceStatusEnum = z.enum(["PRESENT", "ABSENT", "LATE", "HALF_DAY", "LEAVE"]);

const markStudentAttendanceSchema = z.object({
  date: z.coerce.date(),
  departmentId: z.string().uuid().optional(),
  records: z
    .array(
      z.object({
        studentId: z.string().uuid(),
        status: attendanceStatusEnum,
        remarks: z.string().optional(),
      })
    )
    .min(1, "At least one attendance record is required"),
});

const markFacultyAttendanceSchema = z.object({
  date: z.coerce.date(),
  records: z
    .array(
      z.object({
        facultyId: z.string().uuid(),
        status: attendanceStatusEnum,
        remarks: z.string().optional(),
      })
    )
    .min(1, "At least one attendance record is required"),
});

const attendanceReportQuerySchema = z.object({
  studentId: z.string().uuid().optional(),
  departmentId: z.string().uuid().optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

module.exports = {
  markStudentAttendanceSchema,
  markFacultyAttendanceSchema,
  attendanceReportQuerySchema,
};
