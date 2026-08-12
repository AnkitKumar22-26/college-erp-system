// server/src/validators/student.validator.js
const { z } = require("zod");

const studentCreateSchema = z.object({
  admissionNo: z.string().min(1, "Admission number is required"),
  rollNo: z.string().min(1, "Roll number is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  dob: z.coerce.date({ errorMap: () => ({ message: "Enter a valid date of birth" }) }),
  phone: z.string().min(7, "Enter a valid phone number"),
  email: z.string().email("Enter a valid email address"),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  departmentId: z.string().uuid("Select a valid department"),
  semester: z.coerce.number().int().min(1).max(12).default(1),
  section: z.string().default("A"),
  academicYear: z.string().min(4, "Academic year is required"),
  guardianName: z.string().min(1, "Guardian name is required"),
  guardianPhone: z.string().min(7, "Enter a valid guardian phone number"),
  guardianEmail: z.string().email().optional().or(z.literal("")),
  guardianRelation: z.string().optional(),
});

const studentUpdateSchema = studentCreateSchema.partial();

const studentPromoteSchema = z.object({
  studentIds: z.array(z.string().uuid()).min(1, "Select at least one student"),
  toSemester: z.coerce.number().int().min(1).max(12),
});

const studentTransferSchema = z.object({
  departmentId: z.string().uuid("Select a valid department"),
  section: z.string().optional(),
  status: z.enum(["ACTIVE", "PROMOTED", "TRANSFERRED", "GRADUATED", "SUSPENDED", "INACTIVE"]).optional(),
});

module.exports = {
  studentCreateSchema,
  studentUpdateSchema,
  studentPromoteSchema,
  studentTransferSchema,
};
