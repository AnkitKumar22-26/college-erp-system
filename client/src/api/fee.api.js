// client/src/api/fee.api.js
import api from "./axios";

export const feeApi = {
  getStructures: () => api.get("/fees/structures"),
  createStructure: (payload) => api.post("/fees/structures", payload),
  assignFee: (payload) => api.post("/fees/assign", payload),
  getStudentFees: (studentId) => api.get(`/fees/student/${studentId}`),
  getPending: (params) => api.get("/fees/pending", { params }),
  collect: (payload) => api.post("/fees/collect", payload),
  downloadReceiptUrl: (paymentId) => `${api.defaults.baseURL}/fees/receipt/${paymentId}`,
  exportExcel: (params) => api.get("/fees/export/excel", { params, responseType: "blob" }),
};
