// server/src/validators/fee.validator.js
const { z } = require("zod");

const feeStructureCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  academicYear: z.string().min(4, "Academic year is required"),
  semester: z.coerce.number().int().min(1).max(12),
  tuitionFee: z.coerce.number().min(0),
  hostelFee: z.coerce.number().min(0).default(0),
  transportFee: z.coerce.number().min(0).default(0),
  otherFee: z.coerce.number().min(0).default(0),
});

const assignFeeSchema = z.object({
  studentId: z.string().uuid(),
  feeStructureId: z.string().uuid(),
  discount: z.coerce.number().min(0).default(0),
  scholarship: z.coerce.number().min(0).default(0),
  fine: z.coerce.number().min(0).default(0),
  dueDate: z.coerce.date(),
});

const collectFeeSchema = z.object({
  studentFeeId: z.string().uuid(),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  mode: z.enum(["CASH", "CARD", "UPI", "NET_BANKING", "CHEQUE"]),
  remarks: z.string().optional(),
});

module.exports = { feeStructureCreateSchema, assignFeeSchema, collectFeeSchema };
