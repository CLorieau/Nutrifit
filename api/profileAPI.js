import api from "./axiosInstance";

export const getProfile = () => api.get("/users/me");

export const updateProfile = (data) => api.put("/users/me", data);
