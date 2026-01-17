import api from "./axiosInstance";

export const getProfile = () => api.get("/users/me");
