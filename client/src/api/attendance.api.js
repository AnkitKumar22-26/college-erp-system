// client/src/api/attendance.api.js
import api from "./axios";

export const attendanceApi = {
  getStudentAttendance: (params) => api.get("/attendance/students", { params }),
  markStudentAttendance: (payload) => api.post("/attendance/students/mark", payload),
  getStudentReport: (params) => api.get("/attendance/students/report", { params }),
  exportStudentExcel: (params) =>
    api.get("/attendance/students/export/excel", { params, responseType: "blob" }),
  getFacultyAttendance: (params) => api.get("/attendance/faculty", { params }),
  markFacultyAttendance: (payload) => api.post("/attendance/faculty/mark", payload),
  
  // 👉 यह नया फंक्शन हमने यहाँ जोड़ दिया है:
  getMyAttendance: () => api.get("/attendance/my-attendance"),
};