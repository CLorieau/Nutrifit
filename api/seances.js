import api from "./axiosInstance";

export const getSeances = () => api.get("/seances");
export const getSeance = (id) => api.get(`/seances/${id}`);

// ADMIN
export const createSeance = (data) => api.post("/seances", data);
export const updateSeance = (id, data) => api.put(`/seances/${id}`, data);
export const deleteSeance = (id) => api.delete(`/seances/${id}`);
