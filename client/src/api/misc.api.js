// client/src/api/misc.api.js
import api from "./axios";

export const examApi = {
  getSchedules: (params) => api.get("/exams/schedules", { params }),
  createSchedule: (payload) => api.post("/exams/schedules", payload),
  enterResults: (id, results) => api.post(`/exams/schedules/${id}/results`, { results }),
  getStudentResults: (studentId) => api.get(`/exams/results/student/${studentId}`),
};

export const libraryApi = {
  getBooks: (params) => api.get("/library/books", { params }),
  createBook: (payload) => api.post("/library/books", payload),
  issueBook: (payload) => api.post("/library/issue", payload),
  returnBook: (issueId) => api.post(`/library/return/${issueId}`),
  getStudentIssues: (studentId) => api.get(`/library/issues/student/${studentId}`),
};

export const hostelApi = {
  getHostels: () => api.get("/hostel"),
  createHostel: (payload) => api.post("/hostel", payload),
  createRoom: (hostelId, payload) => api.post(`/hostel/${hostelId}/rooms`, payload),
  getVacancy: () => api.get("/hostel/vacancy"),
  allocate: (payload) => api.post("/hostel/allocate", payload),
};

export const transportApi = {
  getRoutes: () => api.get("/transport/routes"),
  createRoute: (payload) => api.post("/transport/routes", payload),
  getVehicles: () => api.get("/transport/vehicles"),
  createVehicle: (payload) => api.post("/transport/vehicles", payload),
  allocate: (payload) => api.post("/transport/allocate", payload),
};

export const noticeApi = {
  list: (params) => api.get("/notices", { params }),
  create: (formData) =>
    api.post("/notices", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  remove: (id) => api.delete(`/notices/${id}`),
};

export const timetableApi = {
  list: (params) => api.get("/timetable", { params }),
  create: (payload) => api.post("/timetable", payload),
  addSlot: (id, payload) => api.post(`/timetable/${id}/slots`, payload),
  getFacultyTimetable: (facultyId) => api.get(`/timetable/faculty/${facultyId}`),
};

export const leaveApi = {
  list: (params) => api.get("/leaves", { params }),
  apply: (payload) => api.post("/leaves", payload),
  updateStatus: (id, payload) => api.patch(`/leaves/${id}/status`, payload),
};

export const placementApi = {
  getCompanies: () => api.get("/placements/companies"),
  createCompany: (payload) => api.post("/placements/companies", payload),
  getDrives: () => api.get("/placements/drives"),
  createDrive: (payload) => api.post("/placements/drives", payload),
  selectStudent: (driveId, studentId) => api.post(`/placements/drives/${driveId}/select`, { studentId }),
  getSelected: () => api.get("/placements/selected"),
};

export const accountApi = {
  getExpenses: (params) => api.get("/accounts/expenses", { params }),
  createExpense: (payload) => api.post("/accounts/expenses", payload),
  getIncomes: (params) => api.get("/accounts/incomes", { params }),
  createIncome: (payload) => api.post("/accounts/incomes", payload),
  getSummary: () => api.get("/accounts/summary"),
};

export const reportApi = {
  studentsExcelUrl: () => `${api.defaults.baseURL}/reports/students/excel`,
  facultyExcelUrl: () => `${api.defaults.baseURL}/reports/faculty/excel`,
  libraryExcelUrl: () => `${api.defaults.baseURL}/reports/library/excel`,
  placementsExcelUrl: () => `${api.defaults.baseURL}/reports/placements/excel`,
};

export const settingsApi = {
  get: () => api.get("/settings"),
  update: (formData) =>
    api.put("/settings", formData, { headers: { "Content-Type": "multipart/form-data" } }),
};
