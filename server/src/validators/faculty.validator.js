// server/src/validators/faculty.validator.js
const { z } = require("zod");

const facultyCreateSchema = z.object({
  employeeCode: z.string().min(1, "Employee code is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  dob: z.coerce.date({ errorMap: () => ({ message: "Enter a valid date of birth" }) }),
  phone: z.string().min(7, "Enter a valid phone number"),
  email: z.string().email("Enter a valid email address"),
  address: z.string().optional(),
  departmentId: z.string().uuid("Select a valid department"),
  designation: z.string().min(1, "Designation is required"),
  qualification: z.string().min(1, "Qualification is required"),
  experienceYrs: z.coerce.number().int().min(0).default(0),
  salary: z.coerce.number().min(0, "Salary must be a positive number"),
  joiningDate: z.coerce.date().optional(),
  subjectIds: z.array(z.string().uuid()).optional(),
});

const facultyUpdateSchema = facultyCreateSchema.partial();

module.exports = { facultyCreateSchema, facultyUpdateSchema };
