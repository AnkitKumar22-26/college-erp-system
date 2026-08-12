// server/prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function hash(pw) {
  return bcrypt.hash(pw, 10);
}

async function main() {
  console.log("Seeding database...");

  await prisma.collegeSettings.deleteMany();
  await prisma.collegeSettings.create({
    data: {
      collegeName: "Greenfield Institute of Technology",
      address: "123 Knowledge Park, Kanpur, UP",
      email: "info@greenfield.edu",
      phone: "+91-9876543210",
      academicYear: "2025-2026",
      currentSemester: 1,
    },
  });

  // ---------- Departments ----------
  const departments = await Promise.all(
    [
      { name: "Computer Science & Engineering", code: "CSE" },
      { name: "Electronics & Communication", code: "ECE" },
      { name: "Mechanical Engineering", code: "MECH" },
      { name: "Civil Engineering", code: "CIVIL" },
    ].map((d) => prisma.department.create({ data: d }))
  );
  const [cse, ece, mech] = departments;

  // ---------- Subjects ----------
  await prisma.subject.createMany({
    data: [
      { name: "Data Structures", code: "CS201", semester: 3, credits: 4, departmentId: cse.id },
      { name: "Database Systems", code: "CS301", semester: 5, credits: 4, departmentId: cse.id },
      { name: "Operating Systems", code: "CS302", semester: 5, credits: 3, departmentId: cse.id },
      { name: "Digital Electronics", code: "EC201", semester: 3, credits: 4, departmentId: ece.id },
      { name: "Thermodynamics", code: "ME201", semester: 3, credits: 3, departmentId: mech.id },
    ],
  });

  // ---------- Users: one per role ----------
  const roleUsers = [
    { email: "admin@erp.com", role: "ADMIN" },
    { email: "principal@erp.com", role: "PRINCIPAL" },
    { email: "accountant@erp.com", role: "ACCOUNTANT" },
    { email: "librarian@erp.com", role: "LIBRARIAN" },
    { email: "receptionist@erp.com", role: "RECEPTIONIST" },
  ];

  for (const u of roleUsers) {
    await prisma.user.create({
      data: { email: u.email, password: await hash("Password@123"), role: u.role },
    });
  }

  // ---------- Faculty (incl. one HOD) ----------
  const facultyUser1 = await prisma.user.create({
    data: { email: "hod.cse@erp.com", password: await hash("Password@123"), role: "HOD" },
  });
  const hodFaculty = await prisma.faculty.create({
    data: {
      userId: facultyUser1.id,
      employeeCode: "EMP001",
      firstName: "Anita",
      lastName: "Sharma",
      gender: "FEMALE",
      dob: new Date("1980-05-14"),
      phone: "9990001111",
      email: "hod.cse@erp.com",
      departmentId: cse.id,
      designation: "Professor & HOD",
      qualification: "Ph.D. Computer Science",
      experienceYrs: 18,
      salary: 120000,
    },
  });
  await prisma.department.update({ where: { id: cse.id }, data: { hodId: hodFaculty.id } });

  const facultyUser2 = await prisma.user.create({
    data: { email: "faculty@erp.com", password: await hash("Password@123"), role: "FACULTY" },
  });
  await prisma.faculty.create({
    data: {
      userId: facultyUser2.id,
      employeeCode: "EMP002",
      firstName: "Rahul",
      lastName: "Verma",
      gender: "MALE",
      dob: new Date("1988-09-21"),
      phone: "9990002222",
      email: "faculty@erp.com",
      departmentId: cse.id,
      designation: "Assistant Professor",
      qualification: "M.Tech Computer Science",
      experienceYrs: 6,
      salary: 65000,
    },
  });

  // ---------- Students ----------
  const studentUser1 = await prisma.user.create({
    data: { email: "student@erp.com", password: await hash("Password@123"), role: "STUDENT" },
  });
  const student1 = await prisma.student.create({
    data: {
      userId: studentUser1.id,
      admissionNo: "ADM2025001",
      rollNo: "CSE001",
      firstName: "Aarav",
      lastName: "Gupta",
      gender: "MALE",
      dob: new Date("2006-03-10"),
      phone: "9998887771",
      email: "student@erp.com",
      address: "45 MG Road",
      city: "Kanpur",
      state: "Uttar Pradesh",
      pincode: "208001",
      departmentId: cse.id,
      semester: 3,
      section: "A",
      academicYear: "2025-2026",
      guardianName: "Rakesh Gupta",
      guardianPhone: "9998887000",
      guardianRelation: "Father",
    },
  });

  const studentUser2 = await prisma.user.create({
    data: { email: "priya.student@erp.com", password: await hash("Password@123"), role: "STUDENT" },
  });
  const student2 = await prisma.student.create({
    data: {
      userId: studentUser2.id,
      admissionNo: "ADM2025002",
      rollNo: "CSE002",
      firstName: "Priya",
      lastName: "Singh",
      gender: "FEMALE",
      dob: new Date("2006-07-22"),
      phone: "9998887772",
      email: "priya.student@erp.com",
      city: "Kanpur",
      state: "Uttar Pradesh",
      departmentId: cse.id,
      semester: 3,
      section: "A",
      academicYear: "2025-2026",
      guardianName: "Suresh Singh",
      guardianPhone: "9998887001",
      guardianRelation: "Father",
    },
  });

  // ---------- Fee Structure & Assignment ----------
  const feeStructure = await prisma.feeStructure.create({
    data: {
      name: "Semester 3 - Regular",
      academicYear: "2025-2026",
      semester: 3,
      tuitionFee: 45000,
      hostelFee: 20000,
      transportFee: 8000,
      otherFee: 2000,
    },
  });

  await prisma.studentFee.create({
    data: {
      studentId: student1.id,
      feeStructureId: feeStructure.id,
      totalAmount: 75000,
      discount: 0,
      scholarship: 5000,
      fine: 0,
      paidAmount: 30000,
      dueDate: new Date("2026-01-31"),
      status: "PARTIAL",
    },
  });

  await prisma.studentFee.create({
    data: {
      studentId: student2.id,
      feeStructureId: feeStructure.id,
      totalAmount: 75000,
      discount: 0,
      scholarship: 0,
      fine: 0,
      paidAmount: 0,
      dueDate: new Date("2026-01-31"),
      status: "PENDING",
    },
  });

  // ---------- Sample attendance (today) ----------
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  await prisma.attendance.createMany({
    data: [
      { studentId: student1.id, date: today, status: "PRESENT" },
      { studentId: student2.id, date: today, status: "ABSENT" },
    ],
  });

  console.log("Seeding complete.");
  console.log("---------------------------------------------");
  console.log("Sample login credentials (password: Password@123 for all):");
  console.log("Admin:        admin@erp.com");
  console.log("Principal:    principal@erp.com");
  console.log("HOD:          hod.cse@erp.com");
  console.log("Faculty:      faculty@erp.com");
  console.log("Student:      student@erp.com");
  console.log("Accountant:   accountant@erp.com");
  console.log("Librarian:    librarian@erp.com");
  console.log("Receptionist: receptionist@erp.com");
  console.log("---------------------------------------------");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
