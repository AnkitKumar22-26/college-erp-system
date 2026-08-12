// client/src/api/student.api.js
import api from "./axios";

export const studentApi = {
  list: (params) => api.get("/students", { params }),
  getById: (id) => api.get(`/students/${id}`),
  create: (formData) =>
    api.post("/students", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  update: (id, formData) =>
    api.put(`/students/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } }),
  remove: (id) => api.delete(`/students/${id}`),
  promote: (studentIds, toSemester) => api.post("/students/promote", { studentIds, toSemester }),
  transfer: (id, payload) => api.patch(`/students/${id}/transfer`, payload),
  exportExcel: (params) =>
    api.get("/students/export/excel", { params, responseType: "blob" }),
};
