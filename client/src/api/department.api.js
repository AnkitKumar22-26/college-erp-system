// client/src/api/department.api.js
import api from "./axios";

export const departmentApi = {
  list: () => api.get("/departments"),
  getById: (id) => api.get(`/departments/${id}`),
  create: (payload) => api.post("/departments", payload),
  update: (id, payload) => api.put(`/departments/${id}`, payload),
  remove: (id) => api.delete(`/departments/${id}`),
  assignHod: (id, facultyId) => api.post(`/departments/${id}/assign-hod`, { facultyId }),
  getSubjects: (id) => api.get(`/departments/${id}/subjects`),
  createSubject: (id, payload) => api.post(`/departments/${id}/subjects`, payload),
};
