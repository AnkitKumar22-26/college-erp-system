# College ERP System

A full-stack College ERP built with **React (Vite + MUI)**, **Node.js / Express**, **PostgreSQL**, and **Prisma ORM**.

Fully implemented end-to-end (frontend + backend + database + validation + exports):
**Authentication · Dashboard · Student Management · Faculty Management · Attendance · Fee Management**

Also included as working backend APIs + database models + basic frontend screens, ready to extend:
Department, Examination, Library, Hostel, Transport, Notice Board, Timetable, Leave Management,
Placements, Accounts, Reports, Settings.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Material UI, React Router, Axios, Recharts, React Toastify |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT (access + refresh tokens) + bcrypt |
| Validation | Zod |
| File Upload | Multer |
| PDF | pdfkit (fee receipts, marksheets) |
| Excel | exceljs (student/faculty/attendance/fee exports) |

---

## Project Structure

```
college-erp/
├── client/                        # React + Vite frontend
│   ├── src/
│   │   ├── api/                   # Axios API modules (one per domain)
│   │   ├── components/
│   │   │   ├── common/            # DataTable, ConfirmDialog, StatCard, ProtectedRoute
│   │   │   └── layout/             # Sidebar, Navbar, Layout
│   │   ├── context/                # AuthContext (JWT session state)
│   │   ├── hooks/                  # useDepartments, useDebounce
│   │   ├── pages/
│   │   │   ├── students/           # List, Form, Profile
│   │   │   ├── faculty/            # List, Form
│   │   │   ├── attendance/         # Mark, Report
│   │   │   ├── fees/               # List, Collect
│   │   │   └── stubs/              # Departments, Exams, Library, Hostel, Transport,
│   │   │                           #   Notices, Timetable, Leaves, Placements, Accounts,
│   │   │                           #   Reports, Settings
│   │   ├── theme/                  # MUI theme (indigo/teal palette)
│   │   ├── App.jsx                 # Routes + role-based access
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/                         # Express backend
│   ├── prisma/
│   │   ├── schema.prisma           # Full data model (18 modules)
│   │   └── seed.js                 # Seed script (sample logins + demo data)
│   ├── src/
│   │   ├── config/db.js            # Prisma client singleton
│   │   ├── controllers/            # One controller per module
│   │   ├── middleware/             # auth (JWT/RBAC), validate (Zod), upload (Multer), errorHandler
│   │   ├── routes/                 # One router per module + index.js aggregator
│   │   ├── utils/                  # ApiError, asyncHandler, pagination, pdf, excel
│   │   ├── validators/             # Zod schemas
│   │   ├── app.js                  # Express app (middleware + routes)
│   │   └── server.js               # Entry point
│   ├── uploads/                    # Uploaded photos/documents (students, faculty, college)
│   ├── .env.example
│   └── package.json
│
├── database/
│   └── schema.sql                  # Raw PostgreSQL DDL (mirrors prisma/schema.prisma)
│
├── docs/
├── .gitignore
└── README.md
```

---

## Prerequisites

- Node.js 18+
- PostgreSQL 14+ (running locally or accessible remotely)
- npm

---

## Installation & Setup

### 1. Clone / extract the project

```bash
cd college-erp
```

### 2. Set up the database

Create a PostgreSQL database:

```bash
psql -U postgres -c "CREATE DATABASE college_erp;"
```

### 3. Backend setup

```bash
cd server
npm install
cp .env.example .env
```

Edit `.env` and set your `DATABASE_URL`, e.g.:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/college_erp?schema=public"
JWT_SECRET=some_long_random_string
JWT_REFRESH_SECRET=another_long_random_string
```

Run Prisma migrations (this creates all tables from `prisma/schema.prisma`):

```bash
npm run prisma:migrate
```

Seed the database with sample departments, users (one per role), students, faculty, and fee records:

```bash
npm run seed
```

Start the API server:

```bash
npm run dev
```

The API will run at `http://localhost:5000`. Health check: `GET http://localhost:5000/api/health`.

### 4. Frontend setup

In a new terminal:

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

The app will run at `http://localhost:5173`.

> `database/schema.sql` is provided for reference / manual provisioning. If you use
> `npm run prisma:migrate` as above, Prisma generates and applies the schema for you —
> you do not need to run the `.sql` file by hand.

---

## Useful Commands

**Backend (`server/`):**

| Command | Description |
|---|---|
| `npm run dev` | Start API with nodemon (auto-reload) |
| `npm start` | Start API in production mode |
| `npm run prisma:generate` | Regenerate the Prisma client |
| `npm run prisma:migrate` | Create/apply a migration in development |
| `npm run prisma:deploy` | Apply migrations in production |
| `npm run prisma:studio` | Open Prisma Studio (visual DB browser) |
| `npm run seed` | Seed the database with demo data |

**Frontend (`client/`):**

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build locally |

---

## Sample Login Credentials

After running `npm run seed`, the following accounts are available.
**Password for all accounts: `Password@123`**

| Role | Email |
|---|---|
| Admin | admin@erp.com |
| Principal | principal@erp.com |
| HOD (Computer Science) | hod.cse@erp.com |
| Faculty | faculty@erp.com |
| Student | student@erp.com |
| Accountant | accountant@erp.com |
| Librarian | librarian@erp.com |
| Receptionist | receptionist@erp.com |

---

## Core Feature Notes

- **Auth**: JWT access tokens (short-lived) + refresh tokens (stored server-side, rotated on
  refresh). Axios automatically retries a failed request once after silently refreshing the token.
- **RBAC**: Every route is protected by `authenticate` + `authorize(...roles)` middleware on the
  backend, and mirrored by `<ProtectedRoute allowedRoles={...}>` on the frontend — both layers
  enforce the same 8 roles (Admin, Principal, HOD, Faculty, Student, Accountant, Librarian,
  Receptionist).
- **Students / Faculty**: Full CRUD with server-side search, filtering (department, semester,
  section, status), pagination, and photo upload (Multer, stored under `server/uploads/`).
  Creating a student/faculty record also creates a linked login (`User`) with a default
  password equal to their admission number / employee code.
- **Attendance**: Daily marking UI per department/section, upserts by `(studentId, date)` so
  re-marking a day updates rather than duplicates. Monthly report with Excel export.
- **Fees**: Fee structures → assigned to students → payments collected against them
  (auto-computing PAID / PARTIAL / PENDING). Each payment can be downloaded as a PDF receipt
  (pdfkit) and the full ledger exported to Excel (exceljs).
- **Reports**: Cross-module Excel exports (students, faculty, library, placements) available to
  Admin/Principal/HOD from the Reports page.

---

## Extending the Scaffolded Modules

Department, Examination, Library, Hostel, Transport, Notice Board, Timetable, Leave, Placements,
Accounts, and Settings already have working backend CRUD APIs, Prisma models, and functional
(if minimal) frontend pages under `client/src/pages/stubs/`. To extend any of them:

1. The Prisma model already exists in `server/prisma/schema.prisma`.
2. The controller + routes already exist under `server/src/controllers` / `server/src/routes`.
3. Add richer Zod validation in `server/src/validators/` if needed.
4. Flesh out the corresponding page in `client/src/pages/stubs/` using the same patterns as
   the Student/Faculty/Attendance/Fee modules (`DataTable`, `PageHeader`, `useDebounce`, etc.).

---

## License

This project was generated as a starter/reference implementation. Use and modify freely for your
own institution or coursework.
