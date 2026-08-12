// client/src/api/faculty.api.js
import api from "./axios";

export const facultyApi = {
  list: (params) => api.get("/faculty", { params }),
  getById: (id) => api.get(`/faculty/${id}`),
  create: (formData) =>
    api.post("/faculty", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  update: (id, formData) =>
    api.put(`/faculty/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } }),
  remove: (id) => api.delete(`/faculty/${id}`),
  exportExcel: (params) => api.get("/faculty/export/excel", { params, responseType: "blob" }),
};
