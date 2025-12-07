import api from "./axiosInstance";

export const signup = (data) => api.post("/signup", data);
export const verifyCode = (data) => api.post("/verify_code", data);

export const login = (email, mot_de_passe) => {
    return api.post("/login", { email, mot_de_passe });
};
