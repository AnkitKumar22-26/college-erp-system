// client/src/api/dashboard.api.js
import api from "./axios";

export const dashboardApi = {
  getStats: () => api.get("/dashboard/stats"),
  getAttendanceChart: () => api.get("/dashboard/charts/attendance"),
  getFeeChart: () => api.get("/dashboard/charts/fees"),
  getDepartmentChart: () => api.get("/dashboard/charts/departments"),
};
