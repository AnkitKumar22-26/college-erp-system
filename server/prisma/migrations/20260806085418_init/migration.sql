-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY', 'STUDENT', 'ACCOUNTANT', 'LIBRARIAN', 'RECEPTIONIST');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'LEAVE');

-- CreateEnum
CREATE TYPE "FeeStatus" AS ENUM ('PAID', 'PARTIAL', 'PENDING', 'OVERDUE');

-- CreateEnum
CREATE TYPE "PaymentMode" AS ENUM ('CASH', 'CARD', 'UPI', 'NET_BANKING', 'CHEQUE');

-- CreateEnum
CREATE TYPE "LeaveStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ExamType" AS ENUM ('INTERNAL', 'EXTERNAL', 'ASSIGNMENT', 'PRACTICAL');

-- CreateEnum
CREATE TYPE "BookStatus" AS ENUM ('ISSUED', 'RETURNED', 'LOST', 'OVERDUE');

-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('ACTIVE', 'PROMOTED', 'TRANSFERRED', 'GRADUATED', 'SUSPENDED', 'INACTIVE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "hodId" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subjects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "semester" INTEGER NOT NULL,
    "credits" INTEGER NOT NULL DEFAULT 3,
    "departmentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "admissionNo" TEXT NOT NULL,
    "rollNo" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "dob" TIMESTAMP(3) NOT NULL,
    "photoUrl" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "pincode" TEXT,
    "departmentId" TEXT NOT NULL,
    "semester" INTEGER NOT NULL DEFAULT 1,
    "section" TEXT NOT NULL DEFAULT 'A',
    "academicYear" TEXT NOT NULL,
    "status" "StudentStatus" NOT NULL DEFAULT 'ACTIVE',
    "guardianName" TEXT NOT NULL,
    "guardianPhone" TEXT NOT NULL,
    "guardianEmail" TEXT,
    "guardianRelation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_documents" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faculty" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "employeeCode" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "dob" TIMESTAMP(3) NOT NULL,
    "photoUrl" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT,
    "departmentId" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "qualification" TEXT NOT NULL,
    "experienceYrs" INTEGER NOT NULL DEFAULT 0,
    "salary" DECIMAL(10,2) NOT NULL,
    "joiningDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faculty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faculty_subjects" (
    "id" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,

    CONSTRAINT "faculty_subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendances" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "status" "AttendanceStatus" NOT NULL,
    "remarks" TEXT,
    "markedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faculty_attendances" (
    "id" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "status" "AttendanceStatus" NOT NULL,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "faculty_attendances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_structures" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL,
    "semester" INTEGER NOT NULL,
    "tuitionFee" DECIMAL(10,2) NOT NULL,
    "hostelFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "transportFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "otherFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fee_structures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_fees" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "feeStructureId" TEXT NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "scholarship" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "fine" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "paidAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "FeeStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_fees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_payments" (
    "id" TEXT NOT NULL,
    "studentFeeId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "mode" "PaymentMode" NOT NULL,
    "receiptNo" TEXT NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "remarks" TEXT,

    CONSTRAINT "fee_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_schedules" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "examType" "ExamType" NOT NULL,
    "examDate" TIMESTAMP(3) NOT NULL,
    "maxMarks" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_results" (
    "id" TEXT NOT NULL,
    "examScheduleId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "marksObtained" DECIMAL(5,2) NOT NULL,
    "grade" TEXT,
    "sgpa" DECIMAL(4,2),
    "cgpa" DECIMAL(4,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "books" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "isbn" TEXT NOT NULL,
    "totalCopies" INTEGER NOT NULL DEFAULT 1,
    "available" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "books_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "book_issues" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "returnDate" TIMESTAMP(3),
    "fine" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "status" "BookStatus" NOT NULL DEFAULT 'ISSUED',

    CONSTRAINT "book_issues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hostels" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "warden" TEXT,

    CONSTRAINT "hostels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "id" TEXT NOT NULL,
    "hostelId" TEXT NOT NULL,
    "roomNo" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 2,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hostel_allocations" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "bedNo" INTEGER NOT NULL,
    "allocatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hostel_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Route" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "vehicleNo" TEXT NOT NULL,
    "driverName" TEXT NOT NULL,
    "driverPhone" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 40,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transport_allocations" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "pickupPoint" TEXT NOT NULL,

    CONSTRAINT "transport_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notices" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "audience" "Role"[],
    "attachment" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetables" (
    "id" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "semester" INTEGER NOT NULL,
    "section" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL,

    CONSTRAINT "timetables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetable_slots" (
    "id" TEXT NOT NULL,
    "timetableId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "room" TEXT,

    CONSTRAINT "timetable_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leaves" (
    "id" TEXT NOT NULL,
    "studentId" TEXT,
    "facultyId" TEXT,
    "fromDate" TIMESTAMP(3) NOT NULL,
    "toDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "LeaveStatus" NOT NULL DEFAULT 'PENDING',
    "approverRemarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leaves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "placement_drives" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "driveDate" TIMESTAMP(3) NOT NULL,
    "role" TEXT NOT NULL,
    "packageLPA" DECIMAL(6,2) NOT NULL,

    CONSTRAINT "placement_drives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "placement_selections" (
    "id" TEXT NOT NULL,
    "driveId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "selectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "placement_selections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordedById" TEXT NOT NULL,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incomes" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordedById" TEXT NOT NULL,

    CONSTRAINT "incomes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "college_settings" (
    "id" TEXT NOT NULL,
    "collegeName" TEXT NOT NULL,
    "logoUrl" TEXT,
    "address" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "academicYear" TEXT NOT NULL,
    "currentSemester" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "college_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "departments_name_key" ON "departments"("name");

-- CreateIndex
CREATE UNIQUE INDEX "departments_code_key" ON "departments"("code");

-- CreateIndex
CREATE UNIQUE INDEX "departments_hodId_key" ON "departments"("hodId");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_code_key" ON "subjects"("code");

-- CreateIndex
CREATE INDEX "subjects_departmentId_idx" ON "subjects"("departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "students_userId_key" ON "students"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "students_admissionNo_key" ON "students"("admissionNo");

-- CreateIndex
CREATE UNIQUE INDEX "students_email_key" ON "students"("email");

-- CreateIndex
CREATE INDEX "students_departmentId_idx" ON "students"("departmentId");

-- CreateIndex
CREATE INDEX "students_status_idx" ON "students"("status");

-- CreateIndex
CREATE UNIQUE INDEX "students_rollNo_departmentId_academicYear_key" ON "students"("rollNo", "departmentId", "academicYear");

-- CreateIndex
CREATE INDEX "student_documents_studentId_idx" ON "student_documents"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "faculty_userId_key" ON "faculty"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "faculty_employeeCode_key" ON "faculty"("employeeCode");

-- CreateIndex
CREATE UNIQUE INDEX "faculty_email_key" ON "faculty"("email");

-- CreateIndex
CREATE INDEX "faculty_departmentId_idx" ON "faculty"("departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "faculty_subjects_facultyId_subjectId_key" ON "faculty_subjects"("facultyId", "subjectId");

-- CreateIndex
CREATE INDEX "attendances_studentId_idx" ON "attendances"("studentId");

-- CreateIndex
CREATE INDEX "attendances_date_idx" ON "attendances"("date");

-- CreateIndex
CREATE UNIQUE INDEX "attendances_studentId_date_key" ON "attendances"("studentId", "date");

-- CreateIndex
CREATE INDEX "faculty_attendances_facultyId_idx" ON "faculty_attendances"("facultyId");

-- CreateIndex
CREATE INDEX "faculty_attendances_date_idx" ON "faculty_attendances"("date");

-- CreateIndex
CREATE UNIQUE INDEX "faculty_attendances_facultyId_date_key" ON "faculty_attendances"("facultyId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "fee_structures_academicYear_semester_name_key" ON "fee_structures"("academicYear", "semester", "name");

-- CreateIndex
CREATE INDEX "student_fees_studentId_idx" ON "student_fees"("studentId");

-- CreateIndex
CREATE INDEX "student_fees_status_idx" ON "student_fees"("status");

-- CreateIndex
CREATE UNIQUE INDEX "fee_payments_receiptNo_key" ON "fee_payments"("receiptNo");

-- CreateIndex
CREATE INDEX "fee_payments_studentId_idx" ON "fee_payments"("studentId");

-- CreateIndex
CREATE INDEX "fee_payments_receiptNo_idx" ON "fee_payments"("receiptNo");

-- CreateIndex
CREATE INDEX "exam_schedules_subjectId_idx" ON "exam_schedules"("subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "exam_results_examScheduleId_studentId_key" ON "exam_results"("examScheduleId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "books_isbn_key" ON "books"("isbn");

-- CreateIndex
CREATE INDEX "book_issues_studentId_idx" ON "book_issues"("studentId");

-- CreateIndex
CREATE INDEX "book_issues_bookId_idx" ON "book_issues"("bookId");

-- CreateIndex
CREATE UNIQUE INDEX "hostels_name_key" ON "hostels"("name");

-- CreateIndex
CREATE UNIQUE INDEX "rooms_hostelId_roomNo_key" ON "rooms"("hostelId", "roomNo");

-- CreateIndex
CREATE UNIQUE INDEX "hostel_allocations_studentId_key" ON "hostel_allocations"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Route_name_key" ON "Route"("name");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_vehicleNo_key" ON "vehicles"("vehicleNo");

-- CreateIndex
CREATE UNIQUE INDEX "transport_allocations_studentId_key" ON "transport_allocations"("studentId");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_hodId_fkey" FOREIGN KEY ("hodId") REFERENCES "faculty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_documents" ADD CONSTRAINT "student_documents_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculty" ADD CONSTRAINT "faculty_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculty" ADD CONSTRAINT "faculty_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculty_subjects" ADD CONSTRAINT "faculty_subjects_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "faculty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculty_subjects" ADD CONSTRAINT "faculty_subjects_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculty_attendances" ADD CONSTRAINT "faculty_attendances_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "faculty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_fees" ADD CONSTRAINT "student_fees_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_fees" ADD CONSTRAINT "student_fees_feeStructureId_fkey" FOREIGN KEY ("feeStructureId") REFERENCES "fee_structures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_payments" ADD CONSTRAINT "fee_payments_studentFeeId_fkey" FOREIGN KEY ("studentFeeId") REFERENCES "student_fees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_payments" ADD CONSTRAINT "fee_payments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_schedules" ADD CONSTRAINT "exam_schedules_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_results" ADD CONSTRAINT "exam_results_examScheduleId_fkey" FOREIGN KEY ("examScheduleId") REFERENCES "exam_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_results" ADD CONSTRAINT "exam_results_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_issues" ADD CONSTRAINT "book_issues_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_issues" ADD CONSTRAINT "book_issues_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_hostelId_fkey" FOREIGN KEY ("hostelId") REFERENCES "hostels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hostel_allocations" ADD CONSTRAINT "hostel_allocations_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hostel_allocations" ADD CONSTRAINT "hostel_allocations_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transport_allocations" ADD CONSTRAINT "transport_allocations_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transport_allocations" ADD CONSTRAINT "transport_allocations_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notices" ADD CONSTRAINT "notices_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetables" ADD CONSTRAINT "timetables_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable_slots" ADD CONSTRAINT "timetable_slots_timetableId_fkey" FOREIGN KEY ("timetableId") REFERENCES "timetables"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable_slots" ADD CONSTRAINT "timetable_slots_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable_slots" ADD CONSTRAINT "timetable_slots_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "faculty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaves" ADD CONSTRAINT "leaves_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaves" ADD CONSTRAINT "leaves_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "faculty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placement_drives" ADD CONSTRAINT "placement_drives_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placement_selections" ADD CONSTRAINT "placement_selections_driveId_fkey" FOREIGN KEY ("driveId") REFERENCES "placement_drives"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placement_selections" ADD CONSTRAINT "placement_selections_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incomes" ADD CONSTRAINT "incomes_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
