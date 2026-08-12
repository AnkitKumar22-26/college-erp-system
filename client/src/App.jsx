// client/src/App.jsx
import { useMemo, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { buildTheme } from "./theme/theme";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Layout from "./components/layout/Layout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

import StudentList from "./pages/students/StudentList";
import StudentForm from "./pages/students/StudentForm";
import StudentProfile from "./pages/students/StudentProfile";
import StudentAttendance from "./pages/students/StudentAttendance";

import FacultyList from "./pages/faculty/FacultyList";
import FacultyForm from "./pages/faculty/FacultyForm";

import AttendanceMark from "./pages/attendance/AttendanceMark";
import AttendanceReport from "./pages/attendance/AttendanceReport";

import FeeList from "./pages/fees/FeeList";
import FeeCollect from "./pages/fees/FeeCollect";

import Departments from "./pages/stubs/Departments";
import Exams from "./pages/stubs/Exams";
import Library from "./pages/stubs/Library";
import Hostel from "./pages/stubs/Hostel";
import Transport from "./pages/stubs/Transport";
import Notices from "./pages/stubs/Notices";
import Timetable from "./pages/stubs/Timetable";
import Leaves from "./pages/stubs/Leaves";
import Placements from "./pages/stubs/Placements";
import Accounts from "./pages/stubs/Accounts";
import Reports from "./pages/stubs/Reports";
import Settings from "./pages/stubs/Settings";

const STAFF = ["ADMIN", "PRINCIPAL", "HOD", "FACULTY", "RECEPTIONIST"];
const MANAGE_FACULTY = ["ADMIN", "PRINCIPAL", "HOD"];
const MANAGE_STUDENTS = ["ADMIN", "PRINCIPAL", "HOD", "RECEPTIONIST"];
const MARK_ATTENDANCE = ["ADMIN", "PRINCIPAL", "HOD", "FACULTY"];
const FINANCE = ["ADMIN", "PRINCIPAL", "ACCOUNTANT"];

// रोल के हिसाब से सही अटेंडेंस पेज दिखाने के लिए कंपोनेंट
function ConditionalAttendanceRoute() {
  const { user } = useAuth();
  if (user?.role === "STUDENT") {
    return <StudentAttendance />;
  }
  return <AttendanceMark />;
}

export default function App() {
  const [mode, setMode] = useState("light");
  const theme = useMemo(() => buildTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              element={
                <ProtectedRoute>
                  <Layout mode={mode} onToggleMode={() => setMode((m) => (m === "light" ? "dark" : "light"))} />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />

              <Route path="/students" element={<ProtectedRoute allowedRoles={STAFF}><StudentList /></ProtectedRoute>} />
              <Route path="/students/new" element={<ProtectedRoute allowedRoles={MANAGE_STUDENTS}><StudentForm /></ProtectedRoute>} />
              <Route path="/students/:id/edit" element={<ProtectedRoute allowedRoles={MANAGE_STUDENTS}><StudentForm /></ProtectedRoute>} />
              <Route path="/students/:id" element={<ProtectedRoute allowedRoles={[...STAFF, "STUDENT"]}><StudentProfile /></ProtectedRoute>} />

              <Route path="/faculty" element={<ProtectedRoute allowedRoles={MANAGE_FACULTY}><FacultyList /></ProtectedRoute>} />
              <Route path="/faculty/new" element={<ProtectedRoute allowedRoles={MANAGE_FACULTY}><FacultyForm /></ProtectedRoute>} />
              <Route path="/faculty/:id/edit" element={<ProtectedRoute allowedRoles={MANAGE_FACULTY}><FacultyForm /></ProtectedRoute>} />

              <Route path="/departments" element={<ProtectedRoute allowedRoles={MANAGE_FACULTY}><Departments /></ProtectedRoute>} />

              {/* अटेंडेंस के राउट्स */}
              <Route 
                path="/attendance" 
                element={
                  <ProtectedRoute allowedRoles={[...MARK_ATTENDANCE, "STUDENT"]}>
                    <ConditionalAttendanceRoute />
                  </ProtectedRoute>
                } 
              />
              <Route path="/attendance/my-attendance" element={<ProtectedRoute allowedRoles={["STUDENT"]}><StudentAttendance /></ProtectedRoute>} />
              <Route path="/attendance/report" element={<ProtectedRoute allowedRoles={[...MARK_ATTENDANCE, "STUDENT", "ACCOUNTANT", "RECEPTIONIST"]}><AttendanceReport /></ProtectedRoute>} />

              <Route path="/fees" element={<ProtectedRoute allowedRoles={FINANCE}><FeeList /></ProtectedRoute>} />
              <Route path="/fees/collect/:studentFeeId" element={<ProtectedRoute allowedRoles={FINANCE}><FeeCollect /></ProtectedRoute>} />

              <Route path="/exams" element={<Exams />} />
              <Route path="/library" element={<Library />} />
              <Route path="/hostel" element={<Hostel />} />
              <Route path="/transport" element={<Transport />} />
              <Route path="/notices" element={<Notices />} />
              <Route path="/timetable" element={<Timetable />} />
              <Route path="/leaves" element={<Leaves />} />
              <Route path="/placements" element={<Placements />} />
              <Route path="/accounts" element={<ProtectedRoute allowedRoles={FINANCE}><Accounts /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute allowedRoles={MANAGE_FACULTY}><Reports /></ProtectedRoute>} />
              <Route path="/settings" element={<Settings />} />

              <Route index element={<Navigate to="/dashboard" replace />} />
            </Route>

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>

        <ToastContainer position="top-right" autoClose={3000} theme={mode} />
      </AuthProvider>
    </ThemeProvider>
  );
}