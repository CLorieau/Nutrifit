import api from "./axiosInstance";

export const getExercices = () => api.get("/exercices");
export const getExercice = (id) => api.get(`/exercices/${id}`);

// ADMIN
export const createExercice = (data) => api.post("/exercices", data);
export const updateExercice = (id, data) => api.put(`/exercices/${id}`, data);
export const deleteExercice = (id) => api.delete(`/exercices/${id}`);
