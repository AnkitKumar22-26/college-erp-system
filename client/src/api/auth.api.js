// client/src/api/auth.api.js
import api from "./axios";

export const authApi = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  logout: (refreshToken) => api.post("/auth/logout", { refreshToken }),
  me: () => api.get("/auth/me"),
  changePassword: (currentPassword, newPassword) =>
    api.post("/auth/change-password", { currentPassword, newPassword }),
};
