import api from "./axiosInstance";

export const getRecettes = () => api.get("/recettes");
export const getRecette = (id) => api.get(`/recettes/${id}`);

// ADMIN
export const createRecette = (data) => api.post("/recettes", data);
export const updateRecette = (id, data) => api.put(`/recettes/${id}`, data);
export const deleteRecette = (id) => api.delete(`/recettes/${id}`);
