-- database/schema.sql
-- College ERP System - PostgreSQL DDL
-- Mirrors server/prisma/schema.prisma exactly.
-- NOTE: If you use Prisma Migrate (`npm run prisma:migrate`), Prisma will
-- generate and apply this schema for you automatically — you do not need
-- to run this file by hand unless you are provisioning the database manually.

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE "Role" AS ENUM ('ADMIN','PRINCIPAL','HOD','FACULTY','STUDENT','ACCOUNTANT','LIBRARIAN','RECEPTIONIST');
CREATE TYPE "Gender" AS ENUM ('MALE','FEMALE','OTHER');
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT','ABSENT','LATE','HALF_DAY','LEAVE');
CREATE TYPE "FeeStatus" AS ENUM ('PAID','PARTIAL','PENDING','OVERDUE');
CREATE TYPE "PaymentMode" AS ENUM ('CASH','CARD','UPI','NET_BANKING','CHEQUE');
CREATE TYPE "LeaveStatus" AS ENUM ('PENDING','APPROVED','REJECTED');
CREATE TYPE "ExamType" AS ENUM ('INTERNAL','EXTERNAL','ASSIGNMENT','PRACTICAL');
CREATE TYPE "BookStatus" AS ENUM ('ISSUED','RETURNED','LOST','OVERDUE');
CREATE TYPE "StudentStatus" AS ENUM ('ACTIVE','PROMOTED','TRANSFERRED','GRADUATED','SUSPENDED','INACTIVE');

-- ============================================================
-- USERS / AUTH
-- ============================================================
CREATE TABLE "users" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "email" TEXT UNIQUE NOT NULL,
  "password" TEXT NOT NULL,
  "role" "Role" NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "lastLoginAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE INDEX "users_role_idx" ON "users"("role");

CREATE TABLE "refresh_tokens" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "token" TEXT UNIQUE NOT NULL,
  "userId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now()
);
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- ============================================================
-- DEPARTMENT / SUBJECT
-- ============================================================
CREATE TABLE "departments" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" TEXT UNIQUE NOT NULL,
  "code" TEXT UNIQUE NOT NULL,
  "hodId" TEXT UNIQUE,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "subjects" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" TEXT NOT NULL,
  "code" TEXT UNIQUE NOT NULL,
  "semester" INTEGER NOT NULL,
  "credits" INTEGER NOT NULL DEFAULT 3,
  "departmentId" TEXT NOT NULL REFERENCES "departments"("id"),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now()
);
CREATE INDEX "subjects_departmentId_idx" ON "subjects"("departmentId");

-- ============================================================
-- STUDENTS
-- ============================================================
CREATE TABLE "students" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT UNIQUE REFERENCES "users"("id"),
  "admissionNo" TEXT UNIQUE NOT NULL,
  "rollNo" TEXT NOT NULL,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "gender" "Gender" NOT NULL,
  "dob" TIMESTAMP(3) NOT NULL,
  "photoUrl" TEXT,
  "phone" TEXT NOT NULL,
  "email" TEXT UNIQUE NOT NULL,
  "address" TEXT,
  "city" TEXT,
  "state" TEXT,
  "pincode" TEXT,
  "departmentId" TEXT NOT NULL REFERENCES "departments"("id"),
  "semester" INTEGER NOT NULL DEFAULT 1,
  "section" TEXT NOT NULL DEFAULT 'A',
  "academicYear" TEXT NOT NULL,
  "status" "StudentStatus" NOT NULL DEFAULT 'ACTIVE',
  "guardianName" TEXT NOT NULL,
  "guardianPhone" TEXT NOT NULL,
  "guardianEmail" TEXT,
  "guardianRelation" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP(3) NOT NULL,
  UNIQUE ("rollNo", "departmentId", "academicYear")
);
CREATE INDEX "students_departmentId_idx" ON "students"("departmentId");
CREATE INDEX "students_status_idx" ON "students"("status");

CREATE TABLE "student_documents" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "studentId" TEXT NOT NULL REFERENCES "students"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "fileUrl" TEXT NOT NULL,
  "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT now()
);
CREATE INDEX "student_documents_studentId_idx" ON "student_documents"("studentId");

-- ============================================================
-- FACULTY
-- ============================================================
CREATE TABLE "faculty" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT UNIQUE REFERENCES "users"("id"),
  "employeeCode" TEXT UNIQUE NOT NULL,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "gender" "Gender" NOT NULL,
  "dob" TIMESTAMP(3) NOT NULL,
  "photoUrl" TEXT,
  "phone" TEXT NOT NULL,
  "email" TEXT UNIQUE NOT NULL,
  "address" TEXT,
  "departmentId" TEXT NOT NULL REFERENCES "departments"("id"),
  "designation" TEXT NOT NULL,
  "qualification" TEXT NOT NULL,
  "experienceYrs" INTEGER NOT NULL DEFAULT 0,
  "salary" DECIMAL(10,2) NOT NULL,
  "joiningDate" TIMESTAMP(3) NOT NULL DEFAULT now(),
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE INDEX "faculty_departmentId_idx" ON "faculty"("departmentId");

-- Deferred FK: departments.hodId -> faculty.id (faculty table must exist first)
ALTER TABLE "departments" ADD CONSTRAINT "departments_hodId_fkey"
  FOREIGN KEY ("hodId") REFERENCES "faculty"("id");

CREATE TABLE "faculty_subjects" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "facultyId" TEXT NOT NULL REFERENCES "faculty"("id") ON DELETE CASCADE,
  "subjectId" TEXT NOT NULL REFERENCES "subjects"("id") ON DELETE CASCADE,
  UNIQUE ("facultyId", "subjectId")
);

-- ============================================================
-- ATTENDANCE
-- ============================================================
CREATE TABLE "attendances" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "studentId" TEXT NOT NULL REFERENCES "students"("id") ON DELETE CASCADE,
  "date" DATE NOT NULL,
  "status" "AttendanceStatus" NOT NULL,
  "remarks" TEXT,
  "markedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now(),
  UNIQUE ("studentId", "date")
);
CREATE INDEX "attendances_studentId_idx" ON "attendances"("studentId");
CREATE INDEX "attendances_date_idx" ON "attendances"("date");

CREATE TABLE "faculty_attendances" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "facultyId" TEXT NOT NULL REFERENCES "faculty"("id") ON DELETE CASCADE,
  "date" DATE NOT NULL,
  "status" "AttendanceStatus" NOT NULL,
  "remarks" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now(),
  UNIQUE ("facultyId", "date")
);
CREATE INDEX "faculty_attendances_facultyId_idx" ON "faculty_attendances"("facultyId");
CREATE INDEX "faculty_attendances_date_idx" ON "faculty_attendances"("date");

-- ============================================================
-- FEES
-- ============================================================
CREATE TABLE "fee_structures" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" TEXT NOT NULL,
  "academicYear" TEXT NOT NULL,
  "semester" INTEGER NOT NULL,
  "tuitionFee" DECIMAL(10,2) NOT NULL,
  "hostelFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "transportFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "otherFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now(),
  UNIQUE ("academicYear", "semester", "name")
);

CREATE TABLE "student_fees" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "studentId" TEXT NOT NULL REFERENCES "students"("id") ON DELETE CASCADE,
  "feeStructureId" TEXT NOT NULL REFERENCES "fee_structures"("id"),
  "totalAmount" DECIMAL(10,2) NOT NULL,
  "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "scholarship" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "fine" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "paidAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "dueDate" TIMESTAMP(3) NOT NULL,
  "status" "FeeStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE INDEX "student_fees_studentId_idx" ON "student_fees"("studentId");
CREATE INDEX "student_fees_status_idx" ON "student_fees"("status");

CREATE TABLE "fee_payments" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "studentFeeId" TEXT NOT NULL REFERENCES "student_fees"("id") ON DELETE CASCADE,
  "studentId" TEXT NOT NULL REFERENCES "students"("id"),
  "amount" DECIMAL(10,2) NOT NULL,
  "mode" "PaymentMode" NOT NULL,
  "receiptNo" TEXT UNIQUE NOT NULL,
  "paidAt" TIMESTAMP(3) NOT NULL DEFAULT now(),
  "remarks" TEXT
);
CREATE INDEX "fee_payments_studentId_idx" ON "fee_payments"("studentId");
CREATE INDEX "fee_payments_receiptNo_idx" ON "fee_payments"("receiptNo");

-- ============================================================
-- EXAMINATION
-- ============================================================
CREATE TABLE "exam_schedules" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "subjectId" TEXT NOT NULL REFERENCES "subjects"("id"),
  "examType" "ExamType" NOT NULL,
  "examDate" TIMESTAMP(3) NOT NULL,
  "maxMarks" INTEGER NOT NULL DEFAULT 100,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now()
);
CREATE INDEX "exam_schedules_subjectId_idx" ON "exam_schedules"("subjectId");

CREATE TABLE "exam_results" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "examScheduleId" TEXT NOT NULL REFERENCES "exam_schedules"("id") ON DELETE CASCADE,
  "studentId" TEXT NOT NULL REFERENCES "students"("id") ON DELETE CASCADE,
  "marksObtained" DECIMAL(5,2) NOT NULL,
  "grade" TEXT,
  "sgpa" DECIMAL(4,2),
  "cgpa" DECIMAL(4,2),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now(),
  UNIQUE ("examScheduleId", "studentId")
);

-- ============================================================
-- LIBRARY
-- ============================================================
CREATE TABLE "books" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "title" TEXT NOT NULL,
  "author" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "isbn" TEXT UNIQUE NOT NULL,
  "totalCopies" INTEGER NOT NULL DEFAULT 1,
  "available" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now()
);

CREATE TABLE "book_issues" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "bookId" TEXT NOT NULL REFERENCES "books"("id"),
  "studentId" TEXT NOT NULL REFERENCES "students"("id"),
  "issueDate" TIMESTAMP(3) NOT NULL DEFAULT now(),
  "dueDate" TIMESTAMP(3) NOT NULL,
  "returnDate" TIMESTAMP(3),
  "fine" DECIMAL(8,2) NOT NULL DEFAULT 0,
  "status" "BookStatus" NOT NULL DEFAULT 'ISSUED'
);
CREATE INDEX "book_issues_studentId_idx" ON "book_issues"("studentId");
CREATE INDEX "book_issues_bookId_idx" ON "book_issues"("bookId");

-- ============================================================
-- HOSTEL
-- ============================================================
CREATE TABLE "hostels" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" TEXT UNIQUE NOT NULL,
  "warden" TEXT
);

CREATE TABLE "rooms" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "hostelId" TEXT NOT NULL REFERENCES "hostels"("id") ON DELETE CASCADE,
  "roomNo" TEXT NOT NULL,
  "capacity" INTEGER NOT NULL DEFAULT 2,
  UNIQUE ("hostelId", "roomNo")
);

CREATE TABLE "hostel_allocations" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "studentId" TEXT UNIQUE NOT NULL REFERENCES "students"("id") ON DELETE CASCADE,
  "roomId" TEXT NOT NULL REFERENCES "rooms"("id"),
  "bedNo" INTEGER NOT NULL,
  "allocatedAt" TIMESTAMP(3) NOT NULL DEFAULT now()
);

-- ============================================================
-- TRANSPORT
-- ============================================================
CREATE TABLE "routes" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" TEXT UNIQUE NOT NULL
);

CREATE TABLE "vehicles" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "routeId" TEXT NOT NULL REFERENCES "routes"("id"),
  "vehicleNo" TEXT UNIQUE NOT NULL,
  "driverName" TEXT NOT NULL,
  "driverPhone" TEXT NOT NULL,
  "capacity" INTEGER NOT NULL DEFAULT 40
);

CREATE TABLE "transport_allocations" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "studentId" TEXT UNIQUE NOT NULL REFERENCES "students"("id") ON DELETE CASCADE,
  "vehicleId" TEXT NOT NULL REFERENCES "vehicles"("id"),
  "pickupPoint" TEXT NOT NULL
);

-- ============================================================
-- NOTICE BOARD
-- ============================================================
CREATE TABLE "notices" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "audience" "Role"[] NOT NULL,
  "attachment" TEXT,
  "createdById" TEXT NOT NULL REFERENCES "users"("id"),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now()
);

-- ============================================================
-- TIMETABLE
-- ============================================================
CREATE TABLE "timetables" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "departmentId" TEXT NOT NULL REFERENCES "departments"("id"),
  "semester" INTEGER NOT NULL,
  "section" TEXT NOT NULL,
  "academicYear" TEXT NOT NULL
);

CREATE TABLE "timetable_slots" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "timetableId" TEXT NOT NULL REFERENCES "timetables"("id") ON DELETE CASCADE,
  "subjectId" TEXT NOT NULL REFERENCES "subjects"("id"),
  "facultyId" TEXT NOT NULL REFERENCES "faculty"("id"),
  "dayOfWeek" INTEGER NOT NULL,
  "startTime" TEXT NOT NULL,
  "endTime" TEXT NOT NULL,
  "room" TEXT
);

-- ============================================================
-- LEAVE MANAGEMENT
-- ============================================================
CREATE TABLE "leaves" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "studentId" TEXT REFERENCES "students"("id"),
  "facultyId" TEXT REFERENCES "faculty"("id"),
  "fromDate" TIMESTAMP(3) NOT NULL,
  "toDate" TIMESTAMP(3) NOT NULL,
  "reason" TEXT NOT NULL,
  "status" "LeaveStatus" NOT NULL DEFAULT 'PENDING',
  "approverRemarks" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now()
);

-- ============================================================
-- PLACEMENTS
-- ============================================================
CREATE TABLE "company" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" TEXT NOT NULL
);

CREATE TABLE "placement_drives" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "companyId" TEXT NOT NULL REFERENCES "company"("id"),
  "driveDate" TIMESTAMP(3) NOT NULL,
  "role" TEXT NOT NULL,
  "packageLPA" DECIMAL(6,2) NOT NULL
);

CREATE TABLE "placement_selections" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "driveId" TEXT NOT NULL REFERENCES "placement_drives"("id"),
  "studentId" TEXT NOT NULL REFERENCES "students"("id"),
  "selectedAt" TIMESTAMP(3) NOT NULL DEFAULT now()
);

-- ============================================================
-- ACCOUNTS
-- ============================================================
CREATE TABLE "expenses" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "title" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "amount" DECIMAL(10,2) NOT NULL,
  "date" TIMESTAMP(3) NOT NULL DEFAULT now(),
  "recordedById" TEXT NOT NULL REFERENCES "users"("id")
);

CREATE TABLE "incomes" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "title" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "amount" DECIMAL(10,2) NOT NULL,
  "date" TIMESTAMP(3) NOT NULL DEFAULT now(),
  "recordedById" TEXT NOT NULL REFERENCES "users"("id")
);

-- ============================================================
-- SETTINGS
-- ============================================================
CREATE TABLE "college_settings" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "collegeName" TEXT NOT NULL,
  "logoUrl" TEXT,
  "address" TEXT,
  "email" TEXT,
  "phone" TEXT,
  "academicYear" TEXT NOT NULL,
  "currentSemester" INTEGER NOT NULL DEFAULT 1,
  "updatedAt" TIMESTAMP(3) NOT NULL
);
